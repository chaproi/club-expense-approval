import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { openLab7Harness, oldFields, type Category } from "./lab7-fixtures.js";

// Additional GREEN verification, not retroactive RED evidence. Expectations are literal.
let h: Awaited<ReturnType<typeof openLab7Harness>>;
before(async () => { h = await openLab7Harness(); });
after(async () => { if (h) await h.close(); });
const pairs = [
  ["ACTIVITY", 1, true], ["ACTIVITY", 100000, true], ["ACTIVITY", 150000, true], ["ACTIVITY", 150001, false],
  ["EQUIPMENT", 1, true], ["EQUIPMENT", 100000, true], ["EQUIPMENT", 120000, true], ["EQUIPMENT", 120001, false],
  ["TRAVEL", 1, true], ["TRAVEL", 100000, true], ["TRAVEL", 100001, false],
  ["ACTIVITY", 125000, true], ["EQUIPMENT", 125000, false], ["TRAVEL", 125000, false],
  ["ACTIVITY", 110000, true], ["EQUIPMENT", 110000, true], ["TRAVEL", 110000, false],
] as const;

async function sqlProbe(id: string, category: Category, amount: number, mode: "insert" | "amount" | "category") {
  return h.db.$transaction(async tx => {
    await tx.$executeRawUnsafe("SAVEPOINT lab7_extra");
    let rows: number | null = null; let code: string | undefined;
    try {
      if (mode === "insert") {
        rows = await tx.$executeRaw`INSERT INTO "ExpenseRequest" ("id","requesterId","assignedReviewerId","title","category","amountBaht","status","revision","createdAt","updatedAt")
          SELECT ${randomUUID()},"requesterId","assignedReviewerId","title",${category}::"ExpenseCategory",${amount},"status","revision","createdAt","updatedAt"
          FROM "ExpenseRequest" WHERE "id"=${id}`;
      } else if (mode === "amount") {
        rows = await tx.$executeRaw`UPDATE "ExpenseRequest" SET "amountBaht"=${amount} WHERE "id"=${id}`;
      } else {
        rows = await tx.$executeRaw`UPDATE "ExpenseRequest" SET "category"=${category}::"ExpenseCategory" WHERE "id"=${id}`;
      }
    } catch (e) { code = (e as { meta?: { code?: string } }).meta?.code; }
    finally { await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT lab7_extra"); await tx.$executeRawUnsafe("RELEASE SAVEPOINT lab7_extra"); }
    return { rows, code };
  });
}
for (const mode of ["insert", "amount"] as const) for (const [category, amount, valid] of pairs) {
  test(`STS-L7-08 additional SQL ${mode}: ${category} ${amount} ${valid}`, async () => {
    const item = await h.create({ ...oldFields, category }); const beforeState = await h.domain();
    const actual = await sqlProbe(item.id, category, amount, mode);
    assert.deepEqual(await h.domain(), beforeState, "Probe rollback preserves every owned row/event");
    assert.deepEqual(actual, valid ? { rows: 1, code: undefined } : { rows: null, code: "23514" });
  });
}
const switches = [
  ["ACTIVITY", 125000, true], ["EQUIPMENT", 125000, false], ["TRAVEL", 125000, false],
  ["ACTIVITY", 110000, true], ["EQUIPMENT", 110000, true], ["TRAVEL", 110000, false],
  ["ACTIVITY", 120000, true], ["EQUIPMENT", 120000, true], ["TRAVEL", 120000, false],
  ["ACTIVITY", 100000, true], ["EQUIPMENT", 100000, true], ["TRAVEL", 100000, true],
] as const;
for (const [category, amount, valid] of switches) {
  test(`STS-L7-08 additional SQL category-only: ACTIVITY${amount} to ${category} ${valid}`, async () => {
    const item = await h.create({ ...oldFields, amountBaht: amount }); const beforeState = await h.domain();
    const actual = await sqlProbe(item.id, category, amount, "category");
    assert.deepEqual(await h.domain(), beforeState);
    assert.deepEqual(actual, valid ? { rows: 1, code: undefined } : { rows: null, code: "23514" });
  });
}

for (const [category, amountBaht] of [["ACTIVITY", 150000], ["EQUIPMENT", 120000], ["TRAVEL", 100000]] as const) {
  test(`STS-L7-05/06 high valid ${category}: access, Origin, state and stale guards preserve exact state`, async () => {
    const fields = { ...oldFields, category, amountBaht }; const item = await h.returned(fields);
    const baseline = await h.snapshot(item.id);
    for (const [actor, expected] of [[undefined, 401], ["other", 404], ["reviewer", 403]] as const) {
      assert.equal((await h.req(actor, "/" + item.id, "PATCH", { ...fields, expectedRevision: 1 })).status, expected);
      assert.deepEqual(await h.snapshot(item.id), baseline);
    }
    assert.equal((await h.req("owner", "/" + item.id, "PATCH", { ...fields, expectedRevision: 1 }, "https://untrusted.example")).status, 403);
    assert.equal((await h.req("owner", "/" + item.id, "PATCH", { ...fields, expectedRevision: 0 })).status, 409);
    assert.deepEqual(await h.snapshot(item.id), baseline);
    assert.equal((await h.req("reviewer", "", "POST", fields)).status, 403);
    assert.equal((await h.req(undefined, "", "POST", fields)).status, 401);
    for (const status of ["SUBMITTED", "APPROVED", "REJECTED"] as const) {
      const terminal = await h.create(fields);
      if (status !== "SUBMITTED") assert.equal((await h.req("reviewer", "/" + terminal.id + "/decision", "POST",
        { decision: status, ...(status === "REJECTED" ? { reason: "Synthetic rejection" } : {}), expectedRevision: 0 })).status, 200);
      const beforeState = await h.snapshot(terminal.id);
      assert.equal((await h.req("owner", "/" + terminal.id, "PATCH", { ...fields, expectedRevision: beforeState.revision })).status, 409);
      assert.deepEqual(await h.snapshot(terminal.id), beforeState);
    }
  });
  test(`STS-L7-06 high valid ${category}: same-revision edit/resubmit race writes exactly once`, async () => {
    const fields = { ...oldFields, category, amountBaht }; const item = await h.returned(fields); const beforeState = await h.snapshot(item.id);
    const outcomes = await Promise.all([
      h.req("owner", "/" + item.id, "PATCH", { ...fields, title: "High-range race edit", expectedRevision: 1 }),
      h.req("owner", "/" + item.id + "/resubmit", "POST", { expectedRevision: 1 }),
    ]);
    assert.deepEqual(outcomes.map(x => x.status).sort(), [200, 409]);
    const final = await h.snapshot(item.id);
    assert.equal(final.revision, 2); assert.equal(final.events.length, 3);
    assert.deepEqual(final.events.slice(0, 2), beforeState.events);
    assert.equal(final.amountBaht, amountBaht); assert.equal(final.category, category);
    assert.equal(final.events[2].type, final.status === "RETURNED" ? "EDITED" : "RESUBMITTED");
    assert.equal(final.id, beforeState.id); assert.equal(final.assignedReviewerId, beforeState.assignedReviewerId);
  });
}
test("STS-L7-05 revoked real sessions deny all three high valid pairs without domain changes", async () => {
  const isolated = await openLab7Harness();
  try {
    const item = await isolated.returned(); const baseline = await isolated.domain();
    await isolated.db.session.deleteMany({ where: { user: { email: isolated.actors.owner.email } } });
    for (const [category, amountBaht] of [["ACTIVITY", 150000], ["EQUIPMENT", 120000], ["TRAVEL", 100000]] as const) {
      assert.equal((await isolated.req("owner", "/" + item.id, "PATCH", { ...oldFields, category, amountBaht, expectedRevision: 1 })).status, 401);
      assert.deepEqual(await isolated.domain(), baseline);
    }
  } finally { await isolated.close(); }
});
test("STS-L7-02 accurate category-specific API feedback and unknown-category denial", async () => {
  const baseline = await h.domain();
  for (const [category, maximum] of [["ACTIVITY", 150000], ["EQUIPMENT", 120000], ["TRAVEL", 100000]] as const) {
    const r = await h.req("owner", "", "POST", { ...oldFields, category, amountBaht: maximum + 1 });
    assert.equal(r.status, 400); const error = (await r.json()).error;
    assert.equal(error.code, "INVALID_INPUT"); assert.ok(error.message.includes(category));
    assert.ok(error.message.includes(maximum.toLocaleString("en-US")));
  }
  for (const category of ["UNKNOWN", "__proto__", "toString", ""]) {
    const r = await h.req("owner", "", "POST", { ...oldFields, category });
    assert.equal(r.status, 400); assert.match((await r.json()).error.message, /select Activity, Equipment or Travel/i);
  }
  assert.deepEqual(await h.domain(), baseline);
});
