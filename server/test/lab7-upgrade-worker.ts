import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Server } from "node:http";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { verifyLab7Target } from "./lab7-fixtures.js";

// Explicit separate worker: actual old application first, then new migration and candidate.
// Snapshot contains private auth material and MUST remain outside Git/evidence.
const [mode, appRoot] = process.argv.slice(2);
assert.ok(mode === "baseline" || mode === "candidate");
const file = process.env.LAB7_UPGRADE_SNAPSHOT;
const report = process.env.LAB7_UPGRADE_REPORT;
assert.ok(file && report, "Private snapshot and redacted report destinations required");
const data: any = mode === "candidate" ? JSON.parse(readFileSync(file, "utf8")) : {
  marker: randomUUID(), password: randomUUID(), items: [],
};
const accounts = {
  owner: { role: "REQUESTER", displayName: "Upgrade Owner" },
  other: { role: "REQUESTER", displayName: "Upgrade Foreign" },
  reviewer: { role: "REVIEWER", displayName: "Upgrade Assigned" },
  outsider: { role: "REVIEWER", displayName: "Upgrade Unassigned" },
} as const;
type Actor = keyof typeof accounts;
const email = (actor: Actor) => `lab7-upgrade-${actor}-${data.marker}@example.test`;
const emails = (Object.keys(accounts) as Actor[]).map(email);
const factory: typeof import("../src/app.js") = await import(pathToFileURL(resolve(appRoot, "server/src/app.ts")).href);
let db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
let server: Server | undefined; let api = ""; let succeeded = false;
const cookies = new Map<Actor, string>();
const checks: string[] = [];
const origin = "http://localhost:5173";
const canonical = (x: unknown) => JSON.stringify(x);
const snap = async () => ({
  users: await db.user.findMany({ orderBy: { id: "asc" } }),
  sessions: await db.session.findMany({ orderBy: { tokenHash: "asc" } }),
  requests: await db.expenseRequest.findMany({ orderBy: { id: "asc" } }),
  events: await db.requestEvent.findMany({ orderBy: { id: "asc" } }),
  migrations: await db.$queryRaw<{ migration_name: string; checksum: string }[]>`SELECT migration_name, checksum FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY migration_name`,
});
async function start() {
  server = await new Promise<Server>((ok, no) => {
    const s = factory.createApp({ database: db, appOrigin: origin, defaultReviewerEmail: email("reviewer") }).listen(0, "127.0.0.1", () => ok(s));
    s.once("error", no);
  });
  const address = server.address(); assert.ok(address && typeof address !== "string");
  api = "http://127.0.0.1:" + address.port;
}
async function stop() {
  if (server) { const s = server; server = undefined; await new Promise<void>((ok, no) => s.close(e => e ? no(e) : ok())); }
  await db.$disconnect();
}
async function login(actor: Actor) {
  const r = await fetch(api + "/api/auth/login", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ email: email(actor), password: data.password }) });
  assert.equal(r.status, 200, "Real authenticated upgrade client");
  const cookie = r.headers.get("set-cookie"); assert.ok(cookie); cookies.set(actor, cookie.split(";")[0]);
}
async function request(actor: Actor | undefined, suffix = "", method = "GET", body?: unknown, expected = 200, source = origin) {
  const r = await fetch(api + "/api/expense-requests" + suffix, { method, headers: { ...(actor ? { Cookie: cookies.get(actor)! } : {}), ...(method === "GET" ? {} : { Origin: source }), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  assert.equal(r.status, expected, "Upgrade HTTP " + method + " expected status");
  const json = await r.json();
  assert.ok(!/passwordHash|tokenHash|requesterId|assignedReviewerId/.test(canonical(json)), "Safe response projection");
  return json;
}
async function readAll(expected: any[]) {
  for (const actor of ["owner", "reviewer"] as const) {
    const list = await request(actor);
    assert.deepEqual(list.items.map((x: any) => x.id).sort(), data.items.map((x: any) => x.id).sort());
    for (const item of expected) assert.deepEqual(await request(actor, "/" + item.id), item);
  }
}
try {
  await verifyLab7Target(db);
  if (mode === "baseline") {
    assert.equal(await db.user.count(), 0);
    const passwordHash = await hash(data.password);
    for (const actor of Object.keys(accounts) as Actor[]) await db.user.create({ data: { email: email(actor), ...accounts[actor], passwordHash } });
    await start(); for (const actor of Object.keys(accounts) as Actor[]) await login(actor);
    for (const category of ["ACTIVITY", "EQUIPMENT", "TRAVEL"] as const) for (const amountBaht of [1, 100000]) for (const status of ["SUBMITTED", "RETURNED", "APPROVED", "REJECTED"] as const) {
      let item = await request("owner", "", "POST", { title: `Old ${category} ${amountBaht} ${status}`, category, amountBaht }, 201);
      if (status !== "SUBMITTED") item = await request("reviewer", "/" + item.id + "/decision", "POST",
        { decision: status, ...(status === "APPROVED" ? {} : { reason: "Owned old-range fixture" }), expectedRevision: 0 });
      data.items.push(item);
    }
    data.snapshot = await snap();
    assert.equal(data.snapshot.requests.length, 24); assert.equal(data.snapshot.events.length, 42); assert.equal(data.snapshot.migrations.length, 3);
    const [constraint] = await db.$queryRaw<{ definition: string }[]>`SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='"ExpenseRequest"'::regclass AND conname='ExpenseRequest_amountBaht_check'`;
    assert.ok(constraint.definition.includes("100000") && !constraint.definition.includes("150000"));
    await readAll(data.items);
    // Quiesce all owned writers/clients before handing the database to migration.
    await stop();
    writeFileSync(file, canonical(data), { flag: "wx", mode: 0o600 });
    checks.push("Actual4535280 application created24 old-range rows /42 events across3 categories,1/100000 and4 valid states");
    checks.push("Owner/assigned readback exact; old CHECK verified; writers/listener/Prisma quiesced before migration");
  } else {
    // First operation after guard is snapshot comparison, before candidate login/session writes.
    const after = await snap();
    for (const key of ["users", "sessions", "requests", "events"] as const) assert.ok(canonical(after[key]) === canonical(data.snapshot[key]), "Immediate " + key + " preservation exact (private comparison)");
    assert.deepEqual(after.migrations.slice(0, 3), data.snapshot.migrations, "Old applied migration checksums unchanged");
    assert.equal(after.migrations.length, 4);
    const [constraint] = await db.$queryRaw<{ definition: string; validated: boolean }[]>`SELECT pg_get_constraintdef(oid) AS definition,convalidated AS validated FROM pg_constraint WHERE conrelid='"ExpenseRequest"'::regclass AND conname='ExpenseRequest_amountBaht_check'`;
    assert.equal(constraint.validated, true);
    assert.ok(["ACTIVITY", "EQUIPMENT", "TRAVEL", "150000", "120000", "100000"].every(x => constraint.definition.includes(x)));
    checks.push("Immediate24 requests/42 events plus assignments,fields,timestamps,revisions,private users/sessions preserved exactly;3 old checksums unchanged");
    await start(); for (const actor of Object.keys(accounts) as Actor[]) await login(actor);
    await readAll(data.items);
    for (const old of data.items.filter((x: any) => x.status === "SUBMITTED")) {
      const maximum = old.category === "ACTIVITY" ? 150000 : old.category === "EQUIPMENT" ? 120000 : 100000;
      let current = await request("reviewer", "/" + old.id + "/decision", "POST", { decision: "RETURNED", reason: "New policy correction", expectedRevision: old.revision });
      const fields = { title: old.title, category: old.category, amountBaht: maximum };
      const beforeDenied = await snap();
      await request(undefined, "/" + old.id, "PATCH", { ...fields, expectedRevision: current.revision }, 401);
      await request("other", "/" + old.id, "PATCH", { ...fields, expectedRevision: current.revision }, 404);
      await request("reviewer", "/" + old.id, "PATCH", { ...fields, expectedRevision: current.revision }, 403);
      await request("owner", "/" + old.id, "PATCH", { ...fields, expectedRevision: current.revision }, 403, "https://untrusted.example");
      await request("owner", "/" + old.id, "PATCH", { ...fields, expectedRevision: old.revision }, 409);
      await request("owner", "/" + old.id, "PATCH", { ...fields, amountBaht: maximum + 1, expectedRevision: current.revision }, 400);
      const afterDenied = await snap();
      assert.deepEqual(afterDenied.requests, beforeDenied.requests); assert.deepEqual(afterDenied.events, beforeDenied.events);
      current = await request("owner", "/" + old.id, "PATCH", { ...fields, expectedRevision: current.revision });
      current = await request("owner", "/" + old.id + "/resubmit", "POST", { expectedRevision: current.revision });
      current = await request("reviewer", "/" + old.id + "/decision", "POST", { decision: "APPROVED", expectedRevision: current.revision });
      assert.equal(current.id, old.id); assert.equal(current.amountBaht, maximum); assert.equal(current.category, old.category); assert.equal(current.revision, 4);
      assert.deepEqual(current.history.slice(0, old.history.length), old.history);
      assert.deepEqual(current.history.map((x: any) => x.type), ["SUBMITTED", "RETURNED", "EDITED", "RESUBMITTED", "APPROVED"]);
    }
    for (const item of data.items.filter((x: any) => x.status === "APPROVED" || x.status === "REJECTED")) {
      await request("owner", "/" + item.id, "PATCH", { title: item.title, category: item.category, amountBaht: item.amountBaht, expectedRevision: item.revision }, 409);
      assert.deepEqual(await request("owner", "/" + item.id), item);
    }
    const summary = await request("reviewer", "/summary");
    assert.deepEqual(summary, { counts: { SUBMITTED: 0, RETURNED: 6, APPROVED: 12, REJECTED: 6 }, total: 24 });
    assert.deepEqual(await request("outsider", "/summary"), { counts: { SUBMITTED: 0, RETURNED: 0, APPROVED: 0, REJECTED: 0 }, total: 0 });
    await request("owner", "/summary", "GET", undefined, 403);
    const final = await snap();
    assert.equal(final.requests.length, 24); assert.equal(final.events.length, 66);
    for (const row of data.snapshot.requests) {
      const now = final.requests.find(x => x.id === row.id)!;
      assert.equal(now.id, row.id); assert.equal(now.requesterId, row.requesterId); assert.equal(now.assignedReviewerId, row.assignedReviewerId); assert.equal(now.createdAt.toISOString(), row.createdAt);
      if (row.status !== "SUBMITTED") assert.equal(canonical(now), canonical(row));
    }
    const expected = [];
    for (const item of data.items) expected.push(await request("owner", "/" + item.id));
    await stop(); db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL }); await verifyLab7Target(db);
    await start();
    await readAll(expected); // New HTTP clients use retained real session cookies after app/Prisma restart.
    const restarted = await snap();
    assert.deepEqual(restarted.requests, final.requests); assert.deepEqual(restarted.events, final.events);
    assert.deepEqual(await request("reviewer", "/summary"), summary);
    checks.push("Six legacy SUBMITTED rows traversed Return/maximum Save/Resubmit/Approve;exact24 retained IDs and66 final events;12 old terminal rows read-only");
    checks.push("High-value auth/ownership/Origin/stale/invalid denials unchanged;assigned counts0/6/12/6 and unassigned zeros");
    checks.push("New application listener/Prisma and HTTP read clients preserve all final fields/history/counts after restart;no browser-storage preservation claim");
  }
  succeeded = true;
} finally {
  await stop();
  if (mode === "candidate" || !succeeded) {
    db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
    try {
      await verifyLab7Target(db);
      await db.expenseRequest.deleteMany({ where: { requester: { email: { in: emails } } } });
      await db.user.deleteMany({ where: { email: { in: emails } } });
      assert.equal(await db.user.count({ where: { email: { in: emails } } }), 0);
      checks.push("Only owned requests/events/sessions/accounts removed;all clients/listeners disconnected");
    } finally { await db.$disconnect(); }
  }
  writeFileSync(report, JSON.stringify({ mode, success: succeeded, checks, requestCountBefore: 24, eventCountBefore: 42, ...(mode === "candidate" && succeeded ? { requestCountAfter: 24, eventCountAfter: 66 } : {}), timestamp: new Date().toISOString() }, null, 2) + "\n");
}
console.log(JSON.stringify({ mode, success: succeeded, checks }));
