import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { before, after, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { createApp } from "../src/app.js";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("Set TEST_DATABASE_URL to an isolated migrated PostgreSQL test database.");
let db = new PrismaClient({ datasourceUrl: url });
const marker = randomUUID();
const password = randomUUID();
const origin = "http://localhost:5173";
const actors = {
  owner: { email: `s2-owner-${marker}@example.test`, displayName: "S2 Owner", role: "REQUESTER" },
  other: { email: `s2-other-${marker}@example.test`, displayName: "S2 Other", role: "REQUESTER" },
  reviewer: { email: `s2-reviewer-${marker}@example.test`, displayName: "S2 Reviewer", role: "REVIEWER" },
  outsider: { email: `s2-outsider-${marker}@example.test`, displayName: "S2 Outsider", role: "REVIEWER" },
} as const;
type Actor = keyof typeof actors;
const cookies = new Map<Actor, string>();
let server: Server;
let api: string;
const valid = { title: "Returnable expense", category: "ACTIVITY", amountBaht: 250 };

async function start() {
  const app = createApp({ database: db, appOrigin: origin, defaultReviewerEmail: actors.reviewer.email });
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });
  const address = server.address(); assert.ok(address && typeof address !== "string");
  api = `http://127.0.0.1:${address.port}/api`;
}
async function stop() { if (server) await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
before(async () => {
  const passwordHash = await hash(password);
  await db.user.createMany({ data: Object.values(actors).map(a => ({ ...a, passwordHash })) });
  await start();
  for (const actor of Object.keys(actors) as Actor[]) {
    const response = await fetch(`${api}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ email: actors[actor].email, password }) });
    assert.equal(response.status, 200);
    cookies.set(actor, response.headers.get("set-cookie")!.split(";")[0]);
  }
});
after(async () => {
  try {
    await stop();
    const email = { in: Object.values(actors).map(a => a.email) };
    await db.expenseRequest.deleteMany({ where: { requester: { email } } });
    await db.user.deleteMany({ where: { email } });
  } finally { await db.$disconnect(); }
});
function req(actor: Actor | undefined, path = "", method = "GET", body?: unknown, source = origin) {
  return fetch(`${api}/expense-requests${path}`, { method, headers: {
    ...(actor ? { Cookie: cookies.get(actor)! } : {}),
    ...(method !== "GET" ? { Origin: source } : {}),
    ...(body === undefined ? {} : { "Content-Type": "application/json" }),
  }, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function create() { const r = await req("owner", "", "POST", valid); assert.equal(r.status, 201); return r.json(); }
async function detail(id: string) { const r = await req("owner", `/${id}`); assert.equal(r.status, 200); return r.json(); }
async function returned(reason = "Please clarify the amount") {
  const item = await create();
  const r = await req("reviewer", `/${item.id}/decision`, "POST", { decision: "RETURNED", reason, expectedRevision: 0 });
  assert.equal(r.status, 200); return r.json();
}

test("T-F04-01: return persists one trimmed reason, owner identity and atomic history", async () => {
  const item = await returned("  More details  ");
  assert.equal(item.status, "RETURNED"); assert.equal(item.revision, 1);
  assert.deepEqual(item.history.map((e: {type: string; reason: string | null}) => [e.type, e.reason]), [["SUBMITTED", null], ["RETURNED", "More details"]]);
  assert.deepEqual(await detail(item.id), item);
  assert.equal((await db.expenseRequest.findUniqueOrThrow({ where: { id: item.id } })).status, "RETURNED");
});
test("T-F04-02: return reason/revision/shape boundaries reject without state changes", async () => {
  const item = await create(); const before = await detail(item.id);
  for (const body of [
    ...["", "   ", "x".repeat(301), "bad\0reason", "\ud800", 42].map(reason => ({ decision: "RETURNED", reason, expectedRevision: 0 })),
    { decision: "RETURNED", reason: "ok" },
    { decision: "RETURNED", reason: "ok", expectedRevision: -1 },
    { decision: "RETURNED", reason: "ok", expectedRevision: 1.5 },
    { decision: "RETURNED", reason: "ok", expectedRevision: 0, requesterId: "forged" },
  ]) { const r = await req("reviewer", `/${item.id}/decision`, "POST", body); assert.equal(r.status, 400); assert.deepEqual(await detail(item.id), before); }
  for (const reason of ["a", "x".repeat(300), "ยืนยัน 🚆"]) assert.equal((await returned(reason)).history.at(-1).reason, reason);
});
test("T-F04-03: wrong principals and origins cannot return or alter protected history", async () => {
  const item = await create(); const before = await detail(item.id);
  const body = { decision: "RETURNED", reason: "Denied", expectedRevision: 0 };
  for (const [actor, status] of [[undefined, 401], ["owner", 403], ["other", 403], ["outsider", 404]] as const) {
    const r = await req(actor, `/${item.id}/decision`, "POST", body); assert.equal(r.status, status); assert.deepEqual(await detail(item.id), before);
  }
  assert.equal((await req("reviewer", `/${item.id}/decision`, "POST", body, "https://untrusted.example")).status, 403);
  assert.deepEqual(await detail(item.id), before);
});
test("T-F04-04: terminal, repeated and concurrent decisions produce only one transition", async () => {
  for (const decision of ["APPROVED", "REJECTED", "RETURNED"]) {
    const item = await create();
    const first = await req("reviewer", `/${item.id}/decision`, "POST", { decision, ...(decision === "APPROVED" ? {} : { reason: "Decision" }), expectedRevision: 0 });
    assert.equal(first.status, 200); const saved = await detail(item.id);
    assert.equal((await req("reviewer", `/${item.id}/decision`, "POST", { decision: "RETURNED", reason: "Repeat", expectedRevision: saved.revision })).status, 409);
    assert.deepEqual(await detail(item.id), saved);
  }
  const item = await create(); const results = await Promise.all([
    req("reviewer", `/${item.id}/decision`, "POST", { decision: "RETURNED", reason: "Race", expectedRevision: 0 }),
    req("reviewer", `/${item.id}/decision`, "POST", { decision: "APPROVED", expectedRevision: 0 }),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal((await detail(item.id)).history.length, 2);
});
test("T-F05-01/04: edit then resubmit preserves ID, assignment, createdAt and older history", async () => {
  const item = await returned(); const stored = await db.expenseRequest.findUniqueOrThrow({ where: { id: item.id } });
  const r = await req("owner", `/${item.id}`, "PATCH", { ...valid, title: "  Corrected expense  ", amountBaht: 400, expectedRevision: 1 });
  assert.equal(r.status, 200); const edited = await r.json();
  assert.equal(edited.title, "Corrected expense"); assert.equal(edited.amountBaht, 400); assert.equal(edited.status, "RETURNED"); assert.equal(edited.revision, 2);
  assert.deepEqual(edited.history.slice(0, 2), item.history); assert.equal(edited.history.at(-1).type, "EDITED");
  const resubmitted = await req("owner", `/${item.id}/resubmit`, "POST", { expectedRevision: 2 });
  assert.equal(resubmitted.status, 200); const saved = await resubmitted.json();
  assert.equal(saved.id, item.id); assert.equal(saved.createdAt, item.createdAt); assert.equal(saved.revision, 3); assert.equal(saved.status, "SUBMITTED");
  assert.deepEqual(saved.history.map((e: {type: string}) => e.type), ["SUBMITTED", "RETURNED", "EDITED", "RESUBMITTED"]);
  assert.equal((await db.expenseRequest.findUniqueOrThrow({ where: { id: item.id } })).assignedReviewerId, stored.assignedReviewerId);
});
test("T-F05-02: invalid and forged edits do not mutate returned fields/history", async () => {
  const item = await returned(); const before = await detail(item.id);
  const bodies = [
    ...[0, 100001, 1.5, "100"].map(amountBaht => ({ ...valid, amountBaht, expectedRevision: 1 })),
    ...["", " ", "x".repeat(121), "bad\0title", "\ud800"].map(title => ({ ...valid, title, expectedRevision: 1 })),
    { ...valid, category: "UNKNOWN", expectedRevision: 1 }, { ...valid, expectedRevision: 1, status: "APPROVED" },
    { ...valid }, { ...valid, expectedRevision: "1" },
  ];
  for (const body of bodies) { assert.equal((await req("owner", `/${item.id}`, "PATCH", body)).status, 400); assert.deepEqual(await detail(item.id), before); }
  for (const [title, amountBaht] of [["a", 1], ["x".repeat(120), 100000]] as const) {
    const fresh = await returned();
    assert.equal((await req("owner", `/${fresh.id}`, "PATCH", { ...valid, title, amountBaht, expectedRevision: 1 })).status, 200);
  }
});
test("T-F05-03: owner/role/state/Origin restrictions protect both edit and resubmit", async () => {
  const item = await returned(); const before = await detail(item.id);
  for (const [actor, status] of [[undefined, 401], ["other", 404], ["reviewer", 403], ["outsider", 403]] as const) {
    assert.equal((await req(actor, `/${item.id}`, "PATCH", { ...valid, expectedRevision: 1 })).status, status);
    assert.equal((await req(actor, `/${item.id}/resubmit`, "POST", { expectedRevision: 1 })).status, status);
    assert.deepEqual(await detail(item.id), before);
  }
  for (const [path, method, body] of [[`/${item.id}`, "PATCH", { ...valid, expectedRevision: 1 }], [`/${item.id}/resubmit`, "POST", { expectedRevision: 1 }]] as const) {
    assert.equal((await req("owner", path, method, body, "https://untrusted.example")).status, 403); assert.deepEqual(await detail(item.id), before);
  }
  for (const decision of [undefined, "APPROVED", "REJECTED"] as const) {
    const fresh = await create();
    if (decision) assert.equal((await req("reviewer", `/${fresh.id}/decision`, "POST", { decision, ...(decision === "REJECTED" ? { reason: "Final" } : {}) })).status, 200);
    const snapshot = await detail(fresh.id);
    assert.equal((await req("owner", `/${fresh.id}`, "PATCH", { ...valid, expectedRevision: snapshot.revision })).status, 409);
    assert.equal((await req("owner", `/${fresh.id}/resubmit`, "POST", { expectedRevision: snapshot.revision })).status, 409);
    assert.deepEqual(await detail(fresh.id), snapshot);
  }
});
test("T-F05-05: stale edits and repeated concurrent resubmits never duplicate events", async () => {
  const item = await returned();
  const saves = await Promise.all([1, 2].map(n => req("owner", `/${item.id}`, "PATCH", { ...valid, title: `Edit ${n}`, expectedRevision: 1 })));
  assert.deepEqual(saves.map(r => r.status).sort(), [200, 409]);
  const edited = await detail(item.id); assert.equal(edited.revision, 2); assert.equal(edited.history.length, 3);
  const results = await Promise.all([1, 2].map(() => req("owner", `/${item.id}/resubmit`, "POST", { expectedRevision: 2 })));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const before = await detail(item.id); assert.equal(before.revision, 3); assert.equal(before.history.length, 4);
  for (const body of [{ decision: "APPROVED" }, { decision: "APPROVED", expectedRevision: 0 }, { decision: "APPROVED", expectedRevision: 2 }]) {
    assert.equal((await req("reviewer", `/${item.id}/decision`, "POST", body)).status, 409); assert.deepEqual(await detail(item.id), before);
  }
  assert.equal((await req("reviewer", `/${item.id}/decision`, "POST", { decision: "APPROVED", expectedRevision: 3 })).status, 200);
  assert.equal((await detail(item.id)).history.length, 5);
});
test("T-F05-05: edit-versus-resubmit race uses the same revision predicate", async () => {
  const item = await returned();
  const r = await Promise.all([req("owner", `/${item.id}`, "PATCH", { ...valid, expectedRevision: 1 }), req("owner", `/${item.id}/resubmit`, "POST", { expectedRevision: 1 })]);
  assert.deepEqual(r.map(x => x.status).sort(), [200, 409]); assert.equal((await detail(item.id)).history.length, 3);
});
test("T-F04-05/T-F05-06: return/edit/resubmit detail survives a new app and Prisma client", async () => {
  const item = await returned(); assert.equal((await req("owner", `/${item.id}/resubmit`, "POST", { expectedRevision: 1 })).status, 200);
  const before = await detail(item.id);
  await stop(); await db.$disconnect(); db = new PrismaClient({ datasourceUrl: url }); await start();
  assert.deepEqual(await detail(item.id), before);
});
test("T-F06-01/02/03: real DB counts include only assigned current records and explicit zeros", async () => {
  const reviewer = await db.user.findUniqueOrThrow({ where: { email: actors.reviewer.email } });
  const outsider = await db.user.findUniqueOrThrow({ where: { email: actors.outsider.email } });
  const owner = await db.user.findUniqueOrThrow({ where: { email: actors.owner.email } });
  await db.expenseRequest.deleteMany({ where: { requesterId: owner.id } });
  await db.expenseRequest.createMany({ data: ["SUBMITTED", "SUBMITTED", "APPROVED", "REJECTED"].map(status => ({ ...valid, requesterId: owner.id, assignedReviewerId: reviewer.id, status: status as "SUBMITTED" | "APPROVED" | "REJECTED" })) });
  await db.expenseRequest.createMany({ data: Array.from({ length: 3 }, () => ({ ...valid, requesterId: owner.id, assignedReviewerId: outsider.id, status: "APPROVED" as const })) });
  const response = await req("reviewer", "/summary"); assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { counts: { SUBMITTED: 2, RETURNED: 0, APPROVED: 1, REJECTED: 1 }, total: 4 });
  const other = await req("outsider", "/summary"); assert.equal(other.status, 200);
  assert.deepEqual(await other.json(), { counts: { SUBMITTED: 0, RETURNED: 0, APPROVED: 3, REJECTED: 0 }, total: 3 });
  assert.equal((await req(undefined, "/summary")).status, 401); assert.equal((await req("owner", "/summary")).status, 403);
  assert.equal((await req("reviewer", "/summary?reviewerId=forged")).status, 400);
});
test("T-F06-01: returning, editing and resubmitting change counts without inflating total", async () => {
  const before = await (await req("reviewer", "/summary")).json();
  const item = await returned();
  let now = await (await req("reviewer", "/summary")).json();
  assert.equal(now.total, before.total + 1); assert.equal(now.counts.RETURNED, before.counts.RETURNED + 1);
  assert.equal((await req("owner", `/${item.id}`, "PATCH", { ...valid, expectedRevision: 1 })).status, 200);
  assert.deepEqual(await (await req("reviewer", "/summary")).json(), now);
  assert.equal((await req("owner", `/${item.id}/resubmit`, "POST", { expectedRevision: 2 })).status, 200);
  now = await (await req("reviewer", "/summary")).json();
  assert.equal(now.total, before.total + 1); assert.equal(now.counts.RETURNED, before.counts.RETURNED); assert.equal(now.counts.SUBMITTED, before.counts.SUBMITTED + 1);
});
test("T-F06-03: empty summary and readback after restart remain exact", async () => {
  const before = await (await req("reviewer", "/summary")).json();
  assert.ok(before.counts); await stop(); await db.$disconnect(); db = new PrismaClient({ datasourceUrl: url }); await start();
  assert.deepEqual(await (await req("reviewer", "/summary")).json(), before);
  const outsider = await db.user.findUniqueOrThrow({ where: { email: actors.outsider.email } });
  await db.expenseRequest.deleteMany({ where: { assignedReviewerId: outsider.id } });
  assert.deepEqual(await (await req("outsider", "/summary")).json(), { counts: { SUBMITTED: 0, RETURNED: 0, APPROVED: 0, REJECTED: 0 }, total: 0 });
});
