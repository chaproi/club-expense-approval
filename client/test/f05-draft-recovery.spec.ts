import { randomBytes } from "node:crypto";
import { test as base, expect, type APIRequestContext, type Page, type Response } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const runId = process.env.E2E_RUN_ID;
const datasourceUrl = process.env.TEST_DATABASE_URL;
if (!runId || !datasourceUrl) throw new Error("Run with the project Playwright configuration and an isolated PostgreSQL database.");

const database = new PrismaClient({ datasourceUrl });
const password = randomBytes(24).toString("hex");
const ownerEmail = "f05-owner-" + runId + "@example.test";
const otherEmail = "f05-other-" + runId + "@example.test";
const reviewerEmail = "reviewer-" + runId + "@example.test";
const emails = [ownerEmail, otherEmail, reviewerEmail];
const endpoint = "/api/expense-requests";

type Fields = { title: string; category: "ACTIVITY" | "TRAVEL" | "EQUIPMENT"; amountBaht: number };
type Expense = Fields & { id: string; revision: number; status: "RETURNED" | "SUBMITTED" | "APPROVED" | "REJECTED" };
type Write = { method: string; suffix: string; body: Record<string, unknown> };

const startFields: Fields = { title: "Training expense", category: "ACTIVITY", amountBaht: 500 };
const draftTitle = "Owner draft for training";
const parallelTitle = "Newer saved training title";

const test = base.extend<{ sessions: { owner: APIRequestContext; reviewer: APIRequestContext; other: APIRequestContext } }>({
  sessions: async ({ playwright, baseURL }, use) => {
    if (!baseURL) throw new Error("Project baseURL is required.");
    const origin = new URL(baseURL).origin;
    const contexts: APIRequestContext[] = [];
    async function apiSession(email: string) {
      const context = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: origin } });
      contexts.push(context);
      const response = await context.post("/api/auth/login", { data: { email, password } });
      expect(response.status(), "fixture API login").toBe(200);
      return context;
    }
    try {
      await use({ owner: await apiSession(ownerEmail), reviewer: await apiSession(reviewerEmail), other: await apiSession(otherEmail) });
    } finally {
      await Promise.all(contexts.map(context => context.dispose()));
    }
  },
});

test.beforeAll(async () => {
  const passwordHash = await hash(password);
  await database.user.createMany({
    data: [
      { email: ownerEmail, displayName: "Draft Requester", role: "REQUESTER", passwordHash },
      { email: otherEmail, displayName: "Other Requester", role: "REQUESTER", passwordHash },
      { email: reviewerEmail, displayName: "Draft Reviewer", role: "REVIEWER", passwordHash },
    ],
  });
});

test.afterEach(async () => {
  // A passing test can leave its worker alive for the next case.
  await database.expenseRequest.deleteMany({ where: { requester: { email: { in: emails } } } });
});

test.afterAll(async () => {
  try {
    await database.expenseRequest.deleteMany({ where: { requester: { email: { in: emails } } } });
    await database.user.deleteMany({ where: { email: { in: emails } } });
    expect(await database.user.count({ where: { email: { in: emails } } }), "owned users removed").toBe(0);
  } finally {
    await database.$disconnect();
  }
});

async function createReturned(owner: APIRequestContext, reviewer: APIRequestContext, fields = startFields) {
  const created = await owner.post(endpoint, { data: fields });
  expect(created.status(), "fixture submit").toBe(201);
  const request: Expense = await created.json();
  const returned = await reviewer.post(endpoint + "/" + request.id + "/decision", {
    data: { decision: "RETURNED", reason: "Please verify the training expense", expectedRevision: request.revision },
  });
  expect(returned.status(), "assigned reviewer returns fixture").toBe(200);
  const item: Expense = await returned.json();
  expect(item).toMatchObject({ ...fields, id: request.id, revision: 1, status: "RETURNED" });
  return item;
}

async function saveFromOtherSession(owner: APIRequestContext, item: Expense, fields: Fields) {
  const response = await owner.patch(endpoint + "/" + item.id, { data: { ...fields, expectedRevision: item.revision } });
  expect(response.status(), "second owner session saves the latest revision").toBe(200);
  const saved: Expense = await response.json();
  expect(saved).toMatchObject({ ...fields, id: item.id, revision: item.revision + 1, status: "RETURNED" });
  return saved;
}

function snapshot(id: string) {
  return database.expenseRequest.findUniqueOrThrow({
    where: { id },
    include: { events: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } },
  });
}

async function login(page: Page, email = ownerEmail) {
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const loginResponse = page.waitForResponse(response => responseMatches(response, "/api/auth/login", "POST"));
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  expect((await loginResponse).status(), "fixture browser login").toBe(200);
  await expect(page.getByRole("heading", { name: "My Requests", exact: true })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeVisible();
}

const detail = (page: Page) => page.getByRole("region", { name: "Request details", exact: true });
const titleField = (page: Page) => page.getByLabel("Corrected title", { exact: true });
const categoryField = (page: Page) => page.getByLabel("Corrected category", { exact: true });
const amountField = (page: Page) => page.getByLabel("Corrected amount (baht)", { exact: true });
const save = (page: Page) => page.getByRole("button", { name: "Save changes", exact: true });
const resubmit = (page: Page) => page.getByRole("button", { name: "Resubmit request", exact: true });
const restore = (page: Page) => page.getByRole("button", { name: "Restore draft", exact: true });
const discard = (page: Page) => page.getByRole("button", { name: "Discard draft", exact: true });
const draft = (page: Page) => page.getByRole("region", { name: /^(your )?unsaved draft$/i });
const latest = (page: Page) => page.getByRole("region", { name: /^latest saved (values|details)$/i });
const reloadWarning = (page: Page) => page.getByText("Reloading this page will discard your unsaved draft.", { exact: true });
const actionBlocked = (page: Page, name: "Save changes" | "Resubmit request") =>
  expect(page.getByRole("button", { name, exact: true }).filter({ visible: true }).and(page.locator(":enabled"))).toHaveCount(0);

async function openReturned(page: Page, item: Expense) {
  await page.getByRole("button", { name: item.title, exact: true }).click();
  await expect(titleField(page)).toHaveValue(item.title);
  await expect(categoryField(page)).toHaveValue(item.category);
  await expect(amountField(page)).toHaveValue(String(item.amountBaht));
}

function trackWrites(page: Page) {
  const writes: Write[] = [];
  page.on("request", request => {
    const pathname = new URL(request.url()).pathname;
    if ((pathname === endpoint || pathname.startsWith(endpoint + "/")) && !["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      writes.push({ method: request.method(), suffix: pathname.slice(endpoint.length), body: request.postDataJSON() });
    }
  });
  return writes;
}

function responseMatches(response: Response, pathname: string, method = "GET") {
  return new URL(response.url()).pathname === pathname && response.request().method() === method;
}

async function staleSave(page: Page, loaded: Expense) {
  const response = page.waitForResponse(r => responseMatches(r, endpoint + "/" + loaded.id, "PATCH"));
  await save(page).click();
  const conflict = await response;
  expect(conflict.status(), "real stale Save returned HTTP 409").toBe(409);
  expect(await conflict.json()).toMatchObject({ error: { code: "INVALID_STATE" } });
}

async function triggerConflict(
  page: Page, owner: APIRequestContext, item: Expense, newest: Fields,
  changes: { title?: string; category?: Fields["category"]; amountBaht?: number },
) {
  if (changes.title !== undefined) await titleField(page).fill(changes.title);
  if (changes.category !== undefined) await categoryField(page).selectOption(changes.category);
  if (changes.amountBaht !== undefined) await amountField(page).fill(String(changes.amountBaht));
  const writes = trackWrites(page);
  const saved = await saveFromOtherSession(owner, item, newest);
  const before = await snapshot(item.id);
  const readback = page.waitForResponse(r => responseMatches(r, endpoint + "/" + item.id));
  const listRefresh = page.waitForResponse(r => responseMatches(r, endpoint));
  await staleSave(page, item);
  const read = await readback;
  expect(read.status(), "real authorized detail reload after 409").toBe(200);
  expect(await read.json()).toMatchObject(saved);
  expect((await listRefresh).status(), "authorized list reload after 409").toBe(200);
  await expect(page.getByRole("button", { name: saved.title, exact: true })).toBeVisible();
  expect(await snapshot(item.id), "stale Save preserves the exact committed snapshot").toEqual(before);
  const attempted = {
    title: changes.title ?? item.title,
    category: changes.category ?? item.category,
    amountBaht: changes.amountBaht ?? item.amountBaht,
  };
  expect(writes, "one browser mutation only, with the original loaded revision").toEqual([
    { method: "PATCH", suffix: "/" + item.id, body: { ...attempted, expectedRevision: item.revision } },
  ]);
  return { writes, saved, before, attempted };
}

const newerFields: Fields = { title: parallelTitle, category: "TRAVEL", amountBaht: 725 };

test("T-F05-07 keeps latest values and the conflicted draft separate after real stale Save", async ({ page, sessions }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  await login(page);
  await openReturned(page, item);
  const conflict = await triggerConflict(page, sessions.owner, item, { ...newerFields, amountBaht: item.amountBaht }, { title: draftTitle, amountBaht: 550 });
  await expect.soft(latest(page), "latest saved panel after a real 409").toBeVisible();
  await expect.soft(draft(page), "unsaved draft remains visible after a real 409").toBeVisible();
  await expect.soft(draft(page).getByText(draftTitle, { exact: false }), "attempted title is still readable").toBeVisible();
  const conflictNotice = detail(page).getByText(/^(?:title(?: has a)? conflict|conflict (?:on|for) title|title (?:was )?changed in both versions)[.:]?$/i);
  await expect.soft(conflictNotice, "same-field Title conflict is identified").toBeVisible();
  if (await latest(page).isVisible() && await draft(page).isVisible()) {
    for (const value of [parallelTitle, "Travel", "500", "RETURNED"]) {
      await expect(latest(page)).toContainText(value);
    }
    await expect(latest(page)).toContainText(new RegExp("revision\\s*:?\\s*" + conflict.saved.revision + "\\b", "i"));
    for (const value of [draftTitle, "Activity", "550"]) await expect(draft(page)).toContainText(value);
  }
  expect(conflict.writes, "recovery view issued no follow-up mutation").toHaveLength(1);
  expect(await snapshot(item.id)).toEqual(conflict.before);
});

for (const field of ["amount", "category"] as const) {
  test("T-F05-08a Restore keeps the latest untouched " + (field === "amount" ? "category" : "amount") + " and waits for manual Save", async ({ page, sessions }) => {
    const item = await createReturned(sessions.owner, sessions.reviewer);
    await login(page);
    await openReturned(page, item);
    const changes = field === "amount" ? { title: draftTitle, amountBaht: 550 } : { title: draftTitle, category: "EQUIPMENT" as const };
    const { writes, saved, before } = await triggerConflict(page, sessions.owner, item, newerFields, changes);
    await expect.soft(restore(page), "explicit Restore is offered after observed real 409").toBeVisible();
    if (await restore(page).isVisible()) {
      await restore(page).click();
      const restored = { ...newerFields, ...changes };
      await expect(titleField(page)).toHaveValue(restored.title);
      await expect(categoryField(page)).toHaveValue(restored.category);
      await expect(amountField(page)).toHaveValue(String(restored.amountBaht));
      await expect(resubmit(page)).toBeDisabled();
      expect(writes, "Restore makes no write").toHaveLength(1);
      expect(await snapshot(item.id)).toEqual(before);
      const response = page.waitForResponse(r => responseMatches(r, endpoint + "/" + item.id, "PATCH"));
      await save(page).click();
      expect((await response).status(), "deliberate Save uses refreshed revision").toBe(200);
      expect(writes).toHaveLength(2);
      expect(writes[1]).toEqual({ method: "PATCH", suffix: "/" + item.id, body: { ...restored, expectedRevision: saved.revision } });
      const after = await snapshot(item.id);
      expect(after).toMatchObject({ ...restored, id: item.id, status: "RETURNED", revision: saved.revision + 1 });
      expect(after.events.slice(0, -1)).toEqual(before.events);
      expect(after.events.at(-1)?.type).toBe("EDITED");
      await expect(draft(page)).toHaveCount(0);
      await expect(reloadWarning(page)).toHaveCount(0);
    } else {
      expect(writes).toHaveLength(1);
      expect(await snapshot(item.id)).toEqual(before);
    }
  });
}

test("T-F05-08b Discard keeps latest saved fields and performs no mutation", async ({ page, sessions }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  await login(page);
  await openReturned(page, item);
  const { writes, before } = await triggerConflict(page, sessions.owner, item, newerFields, { title: draftTitle });
  await expect.soft(discard(page), "explicit Discard is offered after observed real 409").toBeVisible();
  if (await discard(page).isVisible()) {
    await discard(page).click();
    await expect(titleField(page)).toHaveValue(parallelTitle);
    await expect(categoryField(page)).toHaveValue(newerFields.category);
    await expect(amountField(page)).toHaveValue(String(newerFields.amountBaht));
    await expect(save(page)).toBeDisabled();
    await expect(draft(page)).toHaveCount(0);
    await expect(reloadWarning(page)).toHaveCount(0);
  }
  expect(writes, "Discard path issues no mutation beyond the rejected Save").toHaveLength(1);
  expect(await snapshot(item.id)).toEqual(before);
});

for (const status of ["SUBMITTED", "APPROVED"] as const) {
  test("T-F05-09a shows read-only draft when the latest state is " + status, async ({ page, sessions }) => {
    const item = await createReturned(sessions.owner, sessions.reviewer);
    await login(page);
    await openReturned(page, item);
    await titleField(page).fill(draftTitle);
    const writes = trackWrites(page);
    const resubmitted = await sessions.owner.post(endpoint + "/" + item.id + "/resubmit", { data: { expectedRevision: item.revision } });
    expect(resubmitted.status()).toBe(200);
    const round: Expense = await resubmitted.json();
    if (status === "APPROVED") {
      const decided = await sessions.reviewer.post(endpoint + "/" + item.id + "/decision", { data: { decision: status, expectedRevision: round.revision } });
      expect(decided.status()).toBe(200);
    }
    const before = await snapshot(item.id);
    const refreshed = page.waitForResponse(r => responseMatches(r, endpoint + "/" + item.id));
    await staleSave(page, item);
    expect((await (await refreshed).json()).status).toBe(status);
    await expect(detail(page).getByText(status, { exact: false }).last()).toBeVisible();
    await expect(restore(page)).toHaveCount(0);
    await expect(save(page)).toHaveCount(0);
    await expect(resubmit(page)).toHaveCount(0);
    await expect(titleField(page)).toHaveCount(0);
    await expect.soft(draft(page).getByText(draftTitle, { exact: false }), "read-only draft survives status change").toBeVisible();
    await expect.soft(discard(page), "read-only draft can be explicitly discarded").toBeVisible();
    if (await discard(page).isVisible()) {
      await discard(page).click();
      await expect(draft(page)).toHaveCount(0);
    }
    expect(writes).toHaveLength(1);
    expect(await snapshot(item.id)).toEqual(before);
  });
}

test("T-F05-09a revoked owner session cannot read or recover the stale draft", async ({ page, sessions, baseURL }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  await login(page);
  await openReturned(page, item);
  await titleField(page).fill(draftTitle);
  const writes = trackWrites(page);
  await saveFromOtherSession(sessions.owner, item, newerFields);
  const before = await snapshot(item.id);
  const idPath = endpoint + "/" + item.id;
  let revoked: number | undefined;
  // Deliver the real read after revoking this browser's session, without synthesizing a response.
  await page.route(url => url.pathname === idPath, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    if (revoked === undefined) {
      const logoutResponse = await page.request.post("/api/auth/logout", { headers: { Origin: baseURL! } });
      revoked = logoutResponse.status();
    }
    await route.continue();
  });
  const denied = page.waitForResponse(r => responseMatches(r, idPath));
  await staleSave(page, item);
  expect((await denied).status(), "refresh is a genuine 401").toBe(401);
  expect(revoked).toBe(204);
  await expect(page.getByRole("alert").filter({ hasText: /load|sign in|session|access/i }).first()).toBeVisible();
  await expect(draft(page)).toHaveCount(0);
  await expect(restore(page)).toHaveCount(0);
  await expect(titleField(page)).toHaveCount(0);
  expect(writes).toHaveLength(1);
  expect(await snapshot(item.id)).toEqual(before);
  await login(page);
  await openReturned(page, { ...item, ...newerFields });
  await expect(draft(page)).toHaveCount(0);
});

test("T-F05-09b keeps a draft only for its request and clears it when the account changes", async ({ page, sessions }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  const otherRequest = await createReturned(sessions.owner, sessions.reviewer, { ...startFields, title: "Another owned expense" });
  await login(page);
  await openReturned(page, item);
  const { saved, before, writes } = await triggerConflict(page, sessions.owner, item, newerFields, { title: draftTitle });
  await openReturned(page, otherRequest);
  await expect(draft(page)).toHaveCount(0);
  await page.getByRole("button", { name: saved.title, exact: true }).click();
  await expect.soft(draft(page).getByText(draftTitle, { exact: false }), "reselecting the same request retains only its draft").toBeVisible();
  await logout(page);
  await login(page, otherEmail);
  const foreign = await sessions.other.get(endpoint + "/" + item.id);
  expect(foreign.status(), "real cross-owner read denial").toBe(404);
  await expect(page.getByText("No expense requests yet.", { exact: true })).toBeVisible();
  await expect(draft(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: saved.title, exact: true })).toHaveCount(0);
  await logout(page);
  await login(page);
  await openReturned(page, saved);
  await expect(draft(page)).toHaveCount(0);
  expect(writes).toHaveLength(1);
  expect(await snapshot(item.id)).toEqual(before);
});

test("T-F05-09b warns about reload and clears the draft on page reload", async ({ page, sessions }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  await login(page);
  await openReturned(page, item);
  const { saved, writes, before } = await triggerConflict(page, sessions.owner, item, newerFields, { title: draftTitle });
  await expect.soft(reloadWarning(page), "warns that reloading discards the in-memory draft").toBeVisible();
  await page.reload();
  await openReturned(page, saved);
  await expect(draft(page)).toHaveCount(0);
  await expect(reloadWarning(page)).toHaveCount(0);
  expect(writes).toHaveLength(1);
  expect(await snapshot(item.id)).toEqual(before);
});

test("T-F05-10a a failed refresh retains the draft and deliberate retry makes only reads", async ({ page, sessions }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  await login(page);
  await openReturned(page, item);
  await titleField(page).fill(draftTitle);
  const saved = await saveFromOtherSession(sessions.owner, item, newerFields);
  const before = await snapshot(item.id);
  const writes = trackWrites(page);
  const idPath = endpoint + "/" + item.id;
  let aborted = 0;
  await page.route(url => url.pathname === idPath, async route => {
    if (route.request().method() === "GET" && aborted === 0) {
      aborted++;
      await route.abort("failed");
    } else {
      await route.continue();
    }
  });
  const failedRead = page.waitForEvent("requestfailed", req => req.method() === "GET" && new URL(req.url()).pathname === idPath);
  await staleSave(page, item);
  await failedRead;
  expect(aborted).toBe(1);
  await expect(page.getByRole("alert").filter({ hasText: /load|refresh/i }).first()).toBeVisible();
  await actionBlocked(page, "Save changes");
  await actionBlocked(page, "Resubmit request");
  await expect.soft(draft(page).getByText(draftTitle, { exact: false }), "failed GET preserves the local draft").toBeVisible();
  const retry = page.getByRole("button", { name: "Retry loading latest details", exact: true });
  await expect.soft(retry, "explicit read-only retry after the controlled abort").toBeVisible();
  if (await retry.isVisible()) {
    const refreshed = page.waitForResponse(r => responseMatches(r, idPath));
    await retry.click();
    const response = await refreshed;
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject(saved);
    await expect(restore(page)).toBeVisible();
    await expect(draft(page)).toContainText(draftTitle);
  }
  expect(writes).toHaveLength(1);
  expect(await snapshot(item.id)).toEqual(before);
});

test("T-F05-10b a second stale Save retains the new attempt and the newer database revision", async ({ page, sessions }) => {
  const item = await createReturned(sessions.owner, sessions.reviewer);
  await login(page);
  await openReturned(page, item);
  const { saved, writes, before } = await triggerConflict(page, sessions.owner, item, newerFields, { title: draftTitle });
  await expect.soft(restore(page), "first conflict must permit Restore before exercising a second conflict").toBeVisible();
  if (await restore(page).isVisible()) {
    await restore(page).click();
    await expect(titleField(page)).toHaveValue(draftTitle);
    await amountField(page).fill("850");
    expect(writes).toHaveLength(1);
    expect(await snapshot(item.id)).toEqual(before);
    const newer = await saveFromOtherSession(sessions.owner, saved, { ...newerFields, title: "Second saved training title", category: "EQUIPMENT" });
    const secondBefore = await snapshot(item.id);
    const refreshed = page.waitForResponse(r => responseMatches(r, endpoint + "/" + item.id));
    await staleSave(page, saved);
    expect(await (await refreshed).json()).toMatchObject(newer);
    await expect(latest(page)).toContainText(newer.title);
    await expect(draft(page)).toContainText(draftTitle);
    await expect(draft(page)).toContainText("850");
    await expect(restore(page)).toBeVisible();
    expect(writes).toHaveLength(2);
    expect(writes[1].body).toEqual({ title: draftTitle, category: newerFields.category, amountBaht: 850, expectedRevision: saved.revision });
    expect(await snapshot(item.id)).toEqual(secondBefore);
  }
});

for (const action of ["Save", "Resubmit"] as const) {
  test("T-F05-11" + (action === "Save" ? "a" : "b") + " " + action + " transport error retains state and identifies the failed action", async ({ page, sessions }) => {
    const item = await createReturned(sessions.owner, sessions.reviewer);
    await login(page);
    await openReturned(page, item);
    const isSave = action === "Save";
    if (isSave) {
      await titleField(page).fill(draftTitle);
      await categoryField(page).selectOption("EQUIPMENT");
      await amountField(page).fill("525");
    }
    const suffix = "/" + item.id + (isSave ? "" : "/resubmit");
    const method = isSave ? "PATCH" : "POST";
    const target = endpoint + suffix;
    const before = await snapshot(item.id);
    const writes = trackWrites(page);
    let release!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(url => url.pathname === target, async route => {
      if (route.request().method() !== method) {
        await route.continue();
        return;
      }
      await held;
      await route.abort("failed");
    });
    const intercepted = page.waitForRequest(req => req.method() === method && new URL(req.url()).pathname === target);
    const failed = page.waitForEvent("requestfailed", req => req.method() === method && new URL(req.url()).pathname === target);
    try {
      await (isSave ? save(page) : resubmit(page)).click();
      await intercepted;
      await expect(save(page)).toBeDisabled();
      await expect(resubmit(page)).toBeDisabled();
    } finally {
      release();
    }
    await failed;
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(titleField(page)).toHaveValue(isSave ? draftTitle : item.title);
    await expect(categoryField(page)).toHaveValue(isSave ? "EQUIPMENT" : item.category);
    await expect(amountField(page)).toHaveValue(isSave ? "525" : String(item.amountBaht));
    await expect(detail(page)).toContainText("RETURNED");
    if (isSave) {
      await expect(save(page)).toBeEnabled();
      await expect(resubmit(page)).toBeDisabled();
    } else {
      await expect(resubmit(page)).toBeEnabled();
    }
    expect(writes).toEqual([{
      method, suffix, body: isSave
        ? { title: draftTitle, category: "EQUIPMENT", amountBaht: 525, expectedRevision: item.revision }
        : { expectedRevision: item.revision },
    }]);
    expect(await snapshot(item.id)).toEqual(before);
    await expect(page.getByRole("alert"), "error text identifies the failed Requester action").toContainText(
      isSave ? /could not save changes/i : /could not resubmit the request/i,
    );
  });
}
