// Supplementary image HTTP verification; all configuration is private child environment.
// Run only against a new owned schema after image db:migrate/db:seed.
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const { writeFileSync } = require("node:fs");
const requireAt = createRequire(resolve("package.json"));
const { PrismaClient } = requireAt("@prisma/client");
const db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
const base = process.env.LAB7_IMAGE_API, expectedDb = process.env.LAB7_TEST_DATABASE_NAME, schema = process.env.LAB7_IMAGE_SCHEMA;
const report = process.env.LAB7_IMAGE_REPORT, password = process.env.SEED_DEMO_PASSWORD;
const emails = ["requester1@example.test", "requester2@example.test", "reviewer1@example.test", "reviewer2@example.test"];
const cookies = new Map(), ids = new Set(), checks = [];
let guarded = false, success = false;
const snap = async () => ({ requests: await db.expenseRequest.findMany({ orderBy: { id: "asc" } }), events: await db.requestEvent.findMany({ orderBy: { id: "asc" } }) });
async function call(actor, suffix, method = "GET", body, status = 200, origin = base) {
  const r = await fetch(base + "/api" + suffix, { method, headers: { ...(actor ? { Cookie: cookies.get(actor) } : {}), ...(method === "GET" ? {} : { Origin: origin }), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  assert.equal(r.status, status, "Real image HTTP " + method + " expected status");
  if (status === 204) return;
  const json = await r.json();
  if (suffix === "/expense-requests" && status === 201) ids.add(json.id);
  assert.ok(!/passwordHash|tokenHash|requesterId|assignedReviewerId/.test(JSON.stringify(json)), "Image safe projection");
  return json;
}
(async () => {
 try {
  assert.match(expectedDb || "", /^test_lab7_[a-f0-9]{16}$/); assert.match(schema || "", /^lab7_image_[a-f0-9]{16}$/);
  const target = new URL(process.env.TEST_DATABASE_URL), api = new URL(base);
  assert.equal(target.hostname, "127.0.0.1"); assert.equal(target.pathname, "/" + expectedDb); assert.equal(target.username, expectedDb); assert.equal(target.searchParams.get("schema"), schema);
  assert.equal(api.hostname, "127.0.0.1");
  const [live] = await db.$queryRawUnsafe("SELECT current_database() AS db,current_user AS owner,current_schema() AS schema");
  assert.ok(live.db === expectedDb && live.owner === expectedDb && live.schema === schema, "Actual image schema target guard");
  assert.equal(await db.user.count(), 4); assert.equal(await db.expenseRequest.count(), 0); assert.equal(await db.requestEvent.count(), 0);
  assert.equal(await db.user.count({ where: { email: { in: emails } } }), 4); guarded = true;
  assert.equal((await fetch(base)).status, 200); checks.push("Actual image root HTTP200");
  for (const actor of emails) {
    const login = await fetch(base + "/api/auth/login", { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ email: actor, password }) });
    assert.equal(login.status, 200); const cookie = login.headers.get("set-cookie"); assert.ok(cookie); cookies.set(actor, cookie.split(";")[0]);
  }
  for (const [category, maximum] of [["ACTIVITY",150000],["EQUIPMENT",120000],["TRAVEL",100000]]) {
    const fields = { title: "Owned image " + category, category, amountBaht: maximum };
    const before = await snap(); await call(emails[0], "/expense-requests", "POST", { ...fields, amountBaht: maximum + 1 }, 400); assert.deepEqual(await snap(), before);
    let item = await call(emails[0], "/expense-requests", "POST", fields, 201);
    assert.equal(item.revision, 0); assert.equal(item.history.length, 1);
    item = await call(emails[2], "/expense-requests/" + item.id + "/decision", "POST", { decision: "RETURNED", reason: "Image correction", expectedRevision: 0 });
    const state = await snap();
    await call(emails[1], "/expense-requests/" + item.id, "PATCH", { ...fields, expectedRevision: 1 }, 404);
    await call(emails[2], "/expense-requests/" + item.id, "PATCH", { ...fields, expectedRevision: 1 }, 403);
    await call(undefined, "/expense-requests/" + item.id, "PATCH", { ...fields, expectedRevision: 1 }, 401);
    await call(emails[0], "/expense-requests/" + item.id, "PATCH", { ...fields, expectedRevision: 1 }, 403, "https://untrusted.example");
    await call(emails[0], "/expense-requests/" + item.id, "PATCH", { ...fields, expectedRevision: 0 }, 409); assert.deepEqual(await snap(), state);
    item = await call(emails[0], "/expense-requests/" + item.id, "PATCH", { ...fields, expectedRevision: 1 });
    item = await call(emails[0], "/expense-requests/" + item.id + "/resubmit", "POST", { expectedRevision: 2 });
    item = await call(emails[2], "/expense-requests/" + item.id + "/decision", "POST", { decision: "APPROVED", expectedRevision: 3 });
    assert.equal(item.revision, 4); assert.equal(item.amountBaht, maximum); assert.equal(item.category, category);
    assert.deepEqual(item.history.map(x => x.type), ["SUBMITTED","RETURNED","EDITED","RESUBMITTED","APPROVED"]);
    assert.deepEqual(await call(emails[0], "/expense-requests/" + item.id), item);
    checks.push(category + " maximum creation/returned Save/resubmit/decision/history PASS;max+1/access/Origin/stale denials preserve domain");
  }
  const state = await snap(); assert.equal(state.requests.length, 3); assert.equal(state.events.length, 15);
  assert.deepEqual(await call(emails[2], "/expense-requests/summary"), { counts: { SUBMITTED:0, RETURNED:0, APPROVED:3, REJECTED:0 }, total:3 });
  await call(emails[0], "/auth/logout", "POST", undefined, 204);
  await call(emails[0], "/expense-requests", "GET", undefined, 401);
  checks.push("Three exact requests/fifteen events;assigned counts;logout/revoked-cookie denial PASS"); success = true;
 } finally {
  if (guarded) {
    await db.expenseRequest.deleteMany({ where: { requester: { email: { in: emails } } } });
    await db.user.deleteMany({ where: { email: { in: emails } } });
    assert.equal(await db.expenseRequest.count(), 0); assert.equal(await db.requestEvent.count(), 0); assert.equal(await db.user.count(), 0); assert.equal(await db.session.count(), 0);
    checks.push("Owned image schema fixtures/session rows cleared");
  }
  await db.$disconnect();
  if (report) writeFileSync(report, JSON.stringify({ success, checks, finalRequestsBeforeCleanup: success ? 3 : null, finalEventsBeforeCleanup: success ? 15 : null, cleanup: guarded, timestamp: new Date().toISOString() },null,2)+"\n");
 }
 console.log(JSON.stringify({ success, checks }));
})().catch(e => { console.error(e); process.exitCode=1; });
