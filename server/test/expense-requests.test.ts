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

const database = new PrismaClient({ datasourceUrl: databaseUrl });
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

  const options = { database, appOrigin, defaultReviewerEmail: accounts.assigned.email };
  const app = createApp(options);
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  apiUrl = `http://127.0.0.1:${address.port}/api`;

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

after(async () => {
  try {
    const listener = server;
    if (listener) {
      await new Promise<void>((resolve, reject) => {
        listener.close((error) => error ? reject(error) : resolve());
      });
    }
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
