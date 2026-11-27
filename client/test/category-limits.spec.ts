import { test, expect, type Page } from "@playwright/test";
import { openLab7Harness, oldFields } from "../../server/test/lab7-fixtures.js";

let h: Awaited<ReturnType<typeof openLab7Harness>>;
test.beforeAll(async () => { h = await openLab7Harness(true); });
test.afterAll(async () => { if (h) await h.close(); });
const endpoint = "/api/expense-requests";
const matches = (url: string, method: string, suffix: string, expected: string) => new URL(url).pathname === endpoint + suffix && method === expected;
function track(page: Page) {
  const writes: { method: string; path: string; body: unknown }[] = [];
  page.on("request", r => { if (new URL(r.url()).pathname.startsWith(endpoint) && ["POST", "PATCH", "DELETE"].includes(r.method())) writes.push({ method: r.method(), path: new URL(r.url()).pathname, body: r.postDataJSON() }); });
  return writes;
}
async function login(page: Page) {
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill(h.actors.owner.email);
  await page.getByLabel("Password", { exact: true }).fill(h.password);
  const response = page.waitForResponse(r => new URL(r.url()).pathname === "/api/auth/login" && r.request().method() === "POST");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  expect((await response).status(), "real browser authentication prerequisite").toBe(200);
  await expect(page.getByRole("heading", { name: "My Requests", exact: true })).toBeVisible();
}
const amount = (page: Page) => page.getByLabel("Amount (baht)", { exact: true });
const editAmount = (page: Page) => page.getByLabel("Corrected amount (baht)", { exact: true });
const editCategory = (page: Page) => page.getByLabel("Corrected category", { exact: true });
const save = (page: Page) => page.getByRole("button", { name: "Save changes", exact: true });
const resubmit = (page: Page) => page.getByRole("button", { name: "Resubmit request", exact: true });
// Either disabled controls or native form validation may prevent an invalid submission.
async function tryInvalidSubmit(control: ReturnType<typeof save>) {
  if (await control.isEnabled()) await control.click();
}

test("AC-L7-03 STS-L7-03 creation category switches retain amount, explain the pair and never auto-write", async ({ page }) => {
  await login(page); const writes = track(page);
  await page.getByLabel("Title", { exact: true }).fill("Lab7 category-switch creation");
  const category = page.getByRole("combobox", { name: /^Category/ });
  await category.selectOption("ACTIVITY"); await amount(page).fill("125000");
  // First new-behavior assertion; old UI's100000 is meaningful RED, not a click timeout.
  await expect(amount(page), "ACTIVITY must expose its150000 ceiling").toHaveAttribute("max", "150000");
  await category.selectOption("EQUIPMENT");
  await expect(amount(page)).toHaveValue("125000"); await expect(category).toHaveValue("EQUIPMENT");
  await expect(amount(page)).toHaveAttribute("max", "120000");
  await expect(amount(page)).toHaveAccessibleDescription(/120[,. ]?000/);
  expect(await amount(page).evaluate((e: HTMLInputElement) => e.checkValidity())).toBe(false);
  await tryInvalidSubmit(page.getByRole("button", { name: "Submit request", exact: true }));
  expect(writes, "invalid submission and category selection issue no mutation").toEqual([]);
  await category.selectOption("TRAVEL"); await expect(amount(page)).toHaveValue("125000");
  await expect(amount(page)).toHaveAttribute("max", "100000");
  await expect(amount(page)).toHaveAccessibleDescription(/100[,. ]?000/);
  expect(writes).toEqual([]);
  await category.selectOption("ACTIVITY"); await expect(amount(page)).toHaveValue("125000");
  expect(await amount(page).evaluate((e: HTMLInputElement) => e.checkValidity())).toBe(true);
  const created = page.waitForResponse(r => matches(r.url(), r.request().method(), "", "POST"));
  await page.getByRole("button", { name: "Submit request", exact: true }).click();
  const response = await created; expect(response.status()).toBe(201);
  const item = await response.json(); const stored = await h.snapshot(item.id);
  expect(stored).toMatchObject({ category: "ACTIVITY", amountBaht: 125000, revision: 0 });
  expect(stored.events.map(x => x.type)).toEqual(["SUBMITTED"]); expect(writes).toHaveLength(1);
  await expect(category).toHaveValue(""); await expect(amount(page)).toHaveValue("");
});

test("AC-L7-03/04 STS-L7-04 returned category switch retains values and requires explicit valid Save", async ({ page }) => {
  const item = await h.returned({ ...oldFields, title: "Lab7 returned category-switch" });
  const before = await h.snapshot(item.id);
  await login(page); await page.getByRole("button", { name: item.title, exact: true }).click();
  await expect(editAmount(page)).toHaveValue("250"); const writes = track(page);
  await editAmount(page).fill("125000");
  await expect(editAmount(page), "returned ACTIVITY must expose150000").toHaveAttribute("max", "150000");
  await editCategory(page).selectOption("EQUIPMENT");
  await expect(editAmount(page)).toHaveValue("125000"); await expect(editCategory(page)).toHaveValue("EQUIPMENT");
  await expect(editAmount(page)).toHaveAttribute("max", "120000");
  await expect(editAmount(page)).toHaveAccessibleDescription(/120[,. ]?000/);
  await tryInvalidSubmit(save(page)); expect(writes).toEqual([]); expect(await h.snapshot(item.id)).toEqual(before);
  await expect(resubmit(page)).toBeDisabled();
  await editAmount(page).fill("110000");
  expect(await editAmount(page).evaluate((e: HTMLInputElement) => e.checkValidity())).toBe(true);
  const response = page.waitForResponse(r => matches(r.url(), r.request().method(), "/" + item.id, "PATCH"));
  await save(page).click(); expect((await response).status()).toBe(200);
  await expect(page.getByRole("status").filter({ hasText: "Changes saved." })).toBeVisible();
  const saved = await h.snapshot(item.id);
  expect(saved).toMatchObject({ id: item.id, category: "EQUIPMENT", amountBaht: 110000, revision: 2, status: "RETURNED" });
  expect(saved.events.slice(0, 2)).toEqual(before.events); expect(saved.events.at(-1)!.type).toBe("EDITED"); expect(writes).toHaveLength(1);
});

test("AC-L7-04 STS-L7-04 real stale amount draft restored over newer TRAVEL stays invalid without clamping or auto-write", async ({ page }) => {
  const item = await h.returned({ ...oldFields, title: "Lab7 cross-category restored draft" });
  await login(page); await page.getByRole("button", { name: item.title, exact: true }).click();
  await expect(editAmount(page)).toHaveValue("250"); const writes = track(page);
  await editAmount(page).fill("125000");
  const latestResponse = await h.req("owner", "/" + item.id, "PATCH", { ...oldFields, title: item.title, category: "TRAVEL", amountBaht: 100000, expectedRevision: item.revision });
  expect(latestResponse.status, "separate real owner session saves a valid old-range latest pair").toBe(200);
  const latest = await h.snapshot(item.id);
  expect(writes).toEqual([]);
  // On old UI this fails directly; the real409 and restored-invalid-pair checks below are then unreached.
  expect(await editAmount(page).evaluate((e: HTMLInputElement) => e.checkValidity()), "ACTIVITY125000 must be valid before the deliberate stale Save").toBe(true);
  const conflict = page.waitForResponse(r => matches(r.url(), r.request().method(), "/" + item.id, "PATCH"));
  await save(page).click(); const failed = await conflict;
  expect(failed.status()).toBe(409); expect(await failed.json()).toMatchObject({ error: { code: "INVALID_STATE" } });
  await expect(page.getByRole("region", { name: "Latest saved values", exact: true })).toContainText("Travel");
  await expect(page.getByRole("region", { name: "Unsaved draft", exact: true })).toContainText("125000");
  expect(await h.snapshot(item.id)).toEqual(latest);
  await page.getByRole("button", { name: "Restore draft", exact: true }).click();
  await expect(editCategory(page)).toHaveValue("TRAVEL"); await expect(editAmount(page)).toHaveValue("125000");
  await expect(editAmount(page)).toHaveAccessibleDescription(/100[,. ]?000/);
  expect(await editAmount(page).evaluate((e: HTMLInputElement) => e.checkValidity())).toBe(false);
  await tryInvalidSubmit(save(page)); await expect(resubmit(page)).toBeDisabled();
  expect(writes, "Restore/invalid Save never adds a write after the one stale request").toHaveLength(1);
  expect(await h.snapshot(item.id)).toEqual(latest);
  await editCategory(page).selectOption("ACTIVITY"); await expect(editAmount(page)).toHaveValue("125000");
  const manual = page.waitForResponse(r => matches(r.url(), r.request().method(), "/" + item.id, "PATCH"));
  await save(page).click(); expect((await manual).status()).toBe(200);
  await expect(resubmit(page)).toBeEnabled();
  expect(writes[1].body).toMatchObject({ category: "ACTIVITY", amountBaht: 125000, expectedRevision: latest.revision });
  const submit = page.waitForResponse(r => matches(r.url(), r.request().method(), "/" + item.id + "/resubmit", "POST"));
  await resubmit(page).click(); expect((await submit).status()).toBe(200);
  const final = await h.snapshot(item.id);
  expect(final).toMatchObject({ id: item.id, amountBaht: 125000, category: "ACTIVITY", status: "SUBMITTED", revision: 4 });
  expect(final.events.slice(0, 3)).toEqual(latest.events);
  expect(final.events.map(x => x.type)).toEqual(["SUBMITTED", "RETURNED", "EDITED", "EDITED", "RESUBMITTED"]);
  await expect(page.getByRole("region", { name: "Unsaved draft", exact: true })).toHaveCount(0);
});

test("AC-L7-01/03/07 browser preserved TRAVEL max/max+1 control creates one real request", async ({ page }) => {
  await login(page); const writes = track(page);
  await page.getByLabel("Title", { exact: true }).fill("Lab7 preserved travel boundary");
  await page.getByRole("combobox", { name: /^Category/ }).selectOption("TRAVEL");
  await expect(amount(page)).toHaveAttribute("max", "100000"); await expect(amount(page)).toHaveAttribute("min", "1"); await expect(amount(page)).toHaveAttribute("step", "1");
  await amount(page).fill("100001"); expect(await amount(page).evaluate((e: HTMLInputElement) => e.checkValidity())).toBe(false);
  await tryInvalidSubmit(page.getByRole("button", { name: "Submit request", exact: true })); expect(writes).toEqual([]);
  await amount(page).fill("100000"); expect(await amount(page).evaluate((e: HTMLInputElement) => e.checkValidity())).toBe(true);
  const response = page.waitForResponse(r => matches(r.url(), r.request().method(), "", "POST"));
  await page.getByRole("button", { name: "Submit request", exact: true }).click();
  const created = await response; expect(created.status()).toBe(201); const item = await created.json();
  await expect(page.getByRole("button", { name: item.title, exact: true })).toBeVisible();
  const stored = await h.snapshot(item.id);
  expect(stored).toMatchObject({ category: "TRAVEL", amountBaht: 100000, revision: 0, status: "SUBMITTED" });
  expect(stored.events.map(x => x.type)).toEqual(["SUBMITTED"]); expect(writes).toHaveLength(1);
});
