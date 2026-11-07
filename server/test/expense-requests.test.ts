import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { createApp } from "../src/app.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Set TEST_DATABASE_URL to a migrated PostgreSQL test database.");
}

let database = new PrismaClient({ datasourceUrl: databaseUrl });
const appOrigin = "http://localhost:5173";
const uniqueId = randomUUID();
const password = randomUUID();
const accounts = {
  owner: { email: `owner-${uniqueId}@example.test`, displayName: "Expense Owner", role: "REQUESTER" },
  other: { email: `other-${uniqueId}@example.test`, displayName: "Other Requester", role: "REQUESTER" },
  assigned: { email: `assigned-${uniqueId}@example.test`, displayName: "Assigned Reviewer", role: "REVIEWER" },
  unrelated: { email: `unrelated-${uniqueId}@example.test`, displayName: "Unassigned Reviewer", role: "REVIEWER" },
} as const;
const cookies = new Map<keyof typeof accounts, string>();
const validExpense = { title: "Activity supplies", category: "ACTIVITY", amountBaht: 250 };
let server: Server | undefined;
let apiUrl: string;

before(async () => {
  const passwordHash = await hash(password);
  await database.user.createMany({
    data: Object.values(accounts).map((account) => ({ ...account, passwordHash })),
  });

  await startServer();

  for (const actor of ["owner", "other", "assigned", "unrelated"] as const) {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: appOrigin },
      body: JSON.stringify({ email: accounts[actor].email, password }),
    });
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie");
    assert.ok(cookie);
    cookies.set(actor, cookie.split(";")[0]);
  }
});

async function startServer() {
  const app = createApp({ database, appOrigin, defaultReviewerEmail: accounts.assigned.email });
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  apiUrl = `http://127.0.0.1:${address.port}/api`;

}

async function stopServer() {
  const listener = server;
  if (listener) {
    await new Promise<void>((resolve, reject) => {
      listener.close((error) => error ? reject(error) : resolve());
    });
    server = undefined;
  }
}

after(async () => {
  try {
    await stopServer();
    const email = { in: Object.values(accounts).map((account) => account.email) };
    await database.expenseRequest.deleteMany({ where: { requester: { email } } });
    await database.user.deleteMany({ where: { email } });
  } finally {
    await database.$disconnect();
  }
});

function expenseRequest(
  actor?: keyof typeof accounts,
  path = "",
  method = "GET",
  body?: unknown,
  origin = appOrigin,
) {
  const headers = new Headers();
  if (actor) headers.set("Cookie", cookies.get(actor)!);
  if (method !== "GET") headers.set("Origin", origin);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  return fetch(`${apiUrl}/expense-requests${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("T-04: requester submits a read-only expense and reads its stored history", async () => {
  const submitted = await expenseRequest("owner", "", "POST", { ...validExpense, title: "  Activity supplies  " });
  assert.equal(submitted.status, 201);
  const expense = await submitted.json();
  assert.ok(expense.id);
  assert.equal(expense.title, validExpense.title);
  assert.equal(expense.category, validExpense.category);
  assert.equal(expense.amountBaht, validExpense.amountBaht);
  assert.equal(expense.status, "SUBMITTED");
  const stored = await database.expenseRequest.findUniqueOrThrow({
    where: { id: expense.id },
    select: {
      requester: { select: { email: true } },
      assignedReviewer: { select: { email: true } },
      status: true,
    },
  });
  assert.deepEqual(stored, {
    requester: { email: accounts.owner.email },
    assignedReviewer: { email: accounts.assigned.email },
    status: "SUBMITTED",
  });
  assert.deepEqual(expense.history.map(({ type, actorDisplayName, reason }: {
    type: string; actorDisplayName: string; reason: string | null;
  }) => ({ type, actorDisplayName, reason })), [
    { type: "SUBMITTED", actorDisplayName: accounts.owner.displayName, reason: null },
  ]);

  const list = await expenseRequest("owner");
  assert.equal(list.status, 200);
  const { items } = await list.json();
  assert.ok(items.some((item: { id: string }) => item.id === expense.id));
  const detailPath = `/${expense.id}`;
  const attemptedEdit = await expenseRequest("owner", detailPath, "PATCH", { title: "Edited title" });
  assert.equal(attemptedEdit.status, 404);
  const detail = await expenseRequest("owner", detailPath);
  assert.equal(detail.status, 200);
  assert.deepEqual(await detail.json(), expense);
});

test("T-05: API rejects an invalid amount or client-supplied assignment without inserting a record", async () => {
  const before = await expenseRequest("owner");
  assert.equal(before.status, 200);
  const original = await before.json();
  for (const body of [
    { ...validExpense, amountBaht: 0 },
    { ...validExpense, assignedReviewerId: "supplied-by-client" },
  ]) {
    const response = await expenseRequest("owner", "", "POST", body);
    assert.equal(response.status, 400);
  }
  const after = await expenseRequest("owner");
  assert.equal(after.status, 200);
  assert.deepEqual(await after.json(), original);
});

test("T-06: only the owner and assigned reviewer can read an expense, and reviewers cannot submit", async () => {
  const forbidden = await expenseRequest("assigned", "", "POST", validExpense);
  assert.equal(forbidden.status, 403);
  const submitted = await expenseRequest("owner", "", "POST", validExpense);
  assert.equal(submitted.status, 201);
  const { id } = await submitted.json();

  const assignedList = await expenseRequest("assigned");
  assert.equal(assignedList.status, 200);
  assert.ok((await assignedList.json()).items.some((item: { id: string }) => item.id === id));
  assert.equal((await expenseRequest("assigned", `/${id}`)).status, 200);
  assert.equal((await expenseRequest("owner", "/missing")).status, 404);
  for (const actor of ["other", "unrelated"] as const) {
    const list = await expenseRequest(actor);
    assert.equal(list.status, 200);
    assert.deepEqual(await list.json(), { items: [] });
    assert.equal((await expenseRequest(actor, `/${id}`)).status, 404);
  }
});

for (const path of ["/%00", "/%E0%A4%A"]) {
  test(`expense detail rejects a malformed URL segment (${path})`, async () => {
    const response = await expenseRequest("owner", path);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, "INVALID_INPUT");
  });
}

test("T-05: API rejects a title with an unpaired UTF-16 surrogate without inserting a record", async () => {
  const before = await expenseRequest("owner");
  assert.equal(before.status, 200);
  const original = await before.json();
  const response = await expenseRequest("owner", "", "POST", { ...validExpense, title: "\ud800" });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_INPUT");

  const after = await expenseRequest("owner");
  assert.equal(after.status, 200);
  assert.deepEqual(await after.json(), original);
});

test("T-03 extension: anonymous requests cannot list, read or submit expenses", async () => {
  assert.equal((await expenseRequest()).status, 401);
  assert.equal((await expenseRequest(undefined, "/unknown")).status, 401);
  assert.equal((await expenseRequest(undefined, "", "POST", validExpense)).status, 401);
  assert.equal((await expenseRequest(undefined, "/unknown/decision", "POST", { decision: "APPROVED" })).status, 401);
});

async function submitForDecision() {
  const response = await expenseRequest("owner", "", "POST", validExpense);
  assert.equal(response.status, 201);
  return response.json();
}

test("T-07: assigned reviewer approves or rejects and the owner reads the recorded decision", async () => {
  const approved = await submitForDecision();
  const approval = await expenseRequest("assigned", `/${approved.id}/decision`, "POST", { decision: "APPROVED" });
  assert.equal(approval.status, 200);
  assert.equal((await approval.json()).status, "APPROVED");

  const rejected = await submitForDecision();
  for (const reason of ["", "   ", "x".repeat(301), "invalid\0reason", "\ud800"]) {
    const invalid = await expenseRequest("assigned", `/${rejected.id}/decision`, "POST", { decision: "REJECTED", reason });
    assert.equal(invalid.status, 400);
    const unchanged = await expenseRequest("owner", `/${rejected.id}`);
    assert.deepEqual(await unchanged.json(), rejected);
  }
  const rejection = await expenseRequest("assigned", `/${rejected.id}/decision`, "POST", {
    decision: "REJECTED", reason: "  Missing activity details  ",
  });
  assert.equal(rejection.status, 200);
  const saved = await expenseRequest("owner", `/${rejected.id}`);
  const detail = await saved.json();
  assert.equal(detail.status, "REJECTED");
  assert.deepEqual(detail.history.map(({ type, reason, actorDisplayName }: {
    type: string; reason: string | null; actorDisplayName: string;
  }) => ({ type, reason, actorDisplayName })), [
    { type: "SUBMITTED", reason: null, actorDisplayName: accounts.owner.displayName },
    { type: "REJECTED", reason: "Missing activity details", actorDisplayName: accounts.assigned.displayName },
  ]);
});

test("T-06 / T-10: requesters, unassigned reviewers and a self-reviewer cannot decide", async () => {
  const expense = await submitForDecision();
  const path = `/${expense.id}/decision`;
  assert.equal((await expenseRequest("owner", path, "POST", { decision: "APPROVED" })).status, 403);
  assert.equal((await expenseRequest("unrelated", path, "POST", { decision: "APPROVED" })).status, 404);
  assert.equal((await expenseRequest("assigned", path, "POST", { decision: "APPROVED" }, "http://untrusted.example")).status, 403);
  assert.deepEqual(await (await expenseRequest("owner", `/${expense.id}`)).json(), expense);

  const reviewer = await database.user.findUniqueOrThrow({ where: { email: accounts.assigned.email } });
  const selfRequest = await database.expenseRequest.create({
    data: {
      ...validExpense, category: "ACTIVITY", requesterId: reviewer.id, assignedReviewerId: reviewer.id,
      events: { create: { actorId: reviewer.id, type: "SUBMITTED" } },
    },
  });
  const selfDecision = await expenseRequest("assigned", `/${selfRequest.id}/decision`, "POST", { decision: "APPROVED" });
  assert.equal(selfDecision.status, 403);
  const saved = await database.expenseRequest.findUniqueOrThrow({
    where: { id: selfRequest.id }, include: { events: true },
  });
  assert.equal(saved.status, "SUBMITTED");
  assert.equal(saved.events.length, 1);
});

test("T-11: sequential decisions return 200 then 409 and keep one decision event", async () => {
  const expense = await submitForDecision();
  const path = `/${expense.id}/decision`;
  assert.equal((await expenseRequest("assigned", path, "POST", { decision: "APPROVED" })).status, 200);
  assert.equal((await expenseRequest("assigned", path, "POST", { decision: "REJECTED", reason: "Too late" })).status, 409);
  const saved = await (await expenseRequest("owner", `/${expense.id}`)).json();
  assert.equal(saved.status, "APPROVED");
  assert.deepEqual(saved.history.map((event: { type: string }) => event.type), ["SUBMITTED", "APPROVED"]);
});

test("T-11: concurrent decisions produce one success, one conflict and one decision event", async () => {
  const expense = await submitForDecision();
  const path = `/${expense.id}/decision`;
  const responses = await Promise.all([
    expenseRequest("assigned", path, "POST", { decision: "APPROVED" }),
    expenseRequest("assigned", path, "POST", { decision: "REJECTED", reason: "Concurrent rejection" }),
  ]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 409]);
  const saved = await (await expenseRequest("owner", `/${expense.id}`)).json();
  assert.equal(saved.history.length, 2);
  assert.equal(saved.history[1].type, saved.status);
  assert.equal(saved.history[1].actorDisplayName, accounts.assigned.displayName);
});

test("T-08: owner reads the decision after restarting the app and database client", async () => {
  const expense = await submitForDecision();
  const decided = await expenseRequest("assigned", `/${expense.id}/decision`, "POST", { decision: "APPROVED" });
  assert.equal(decided.status, 200);
  const expected = await decided.json();
  await stopServer();
  await database.$disconnect();
  database = new PrismaClient({ datasourceUrl: databaseUrl });
  await startServer();
  const reloaded = await expenseRequest("owner", `/${expense.id}`);
  assert.equal(reloaded.status, 200);
  assert.deepEqual(await reloaded.json(), expected);
});

test("an authenticated browser cannot submit an expense from another origin", async () => {
  const response = await expenseRequest("owner", "", "POST", validExpense, "http://untrusted.example");
  assert.equal(response.status, 403);
});

test("submission fails without creating an expense when the assigned account is not a reviewer", async () => {
  const where = { email: accounts.assigned.email };
  const list = await expenseRequest("owner");
  assert.equal(list.status, 200);
  const original = await list.json();
  await database.user.update({ where, data: { role: "REQUESTER" } });
  try {
    const response = await expenseRequest("owner", "", "POST", validExpense);
    assert.equal(response.status, 503);
    const after = await expenseRequest("owner");
    assert.equal(after.status, 200);
    assert.deepEqual(await after.json(), original);
  } finally {
    await database.user.update({ where, data: { role: "REVIEWER" } });
  }
});
