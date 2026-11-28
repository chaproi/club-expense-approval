import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { openLab7Harness, oldFields, type Category } from "./lab7-fixtures.js";

let h: Awaited<ReturnType<typeof openLab7Harness>>;
before(async () => { h = await openLab7Harness(); });
after(async () => { if (h) await h.close(); });

// AC-L7-01/02, STS-L7-02/03/04: literal independent expectations, not production-derived.
const cases = [
  ["ACTIVITY", 1, true], ["ACTIVITY", 150000, true], ["ACTIVITY", 150001, false],
  ["EQUIPMENT", 1, true], ["EQUIPMENT", 120000, true], ["EQUIPMENT", 120001, false],
  ["TRAVEL", 1, true], ["TRAVEL", 100000, true], ["TRAVEL", 100001, false],
  ["ACTIVITY", 125000, true], ["EQUIPMENT", 125000, false], ["TRAVEL", 125000, false],
  ["ACTIVITY", 110000, true], ["EQUIPMENT", 110000, true], ["TRAVEL", 110000, false],
] as const;

for (const operation of ["creation", "returned Save"] as const) {
  for (const [category, amountBaht, accepted] of cases) {
    test(`AC-L7-01/02 API ${operation}: ${category} ${amountBaht} ${accepted ? "accepted" : "rejected"}`, async () => {
      const item = operation === "returned Save" ? await h.returned() : null;
      const beforeState = await h.domain();
      const fields = { ...oldFields, category, amountBaht };
      const response = await h.req("owner", item ? `/${item.id}` : "", item ? "PATCH" : "POST", item ? { ...fields, expectedRevision: item.revision } : fields);
      assert.equal(response.status, accepted ? item ? 200 : 201 : 400, "Real HTTP status for independently expected category/amount pair");
      const body = await response.json();
      if (!accepted) {
        assert.equal(body.error.code, "INVALID_INPUT");
        assert.deepEqual(await h.domain(), beforeState, "Invalid pair leaves all owned fields, timestamps, revisions and events unchanged");
      } else {
        assert.equal(body.category, category); assert.equal(body.amountBaht, amountBaht);
        const saved = await h.snapshot(body.id);
        assert.equal(saved.category, category); assert.equal(saved.amountBaht, amountBaht);
        assert.equal(saved.revision, item ? item.revision + 1 : 0);
        assert.equal(saved.status, item ? "RETURNED" : "SUBMITTED");
        assert.equal(saved.events.length, item ? 3 : 1);
        assert.equal(saved.events.at(-1)!.type, item ? "EDITED" : "SUBMITTED");
        if (item) {
          const old = beforeState.find(x => x.id === item.id)!;
          assert.equal(saved.id, old.id); assert.equal(saved.assignedReviewerId, old.assignedReviewerId);
          assert.deepEqual(saved.createdAt, old.createdAt); assert.deepEqual(saved.events.slice(0, 2), old.events);
        }
        const read = await h.req("reviewer", `/${saved.id}`); assert.equal(read.status, 200);
        assert.equal((await read.json()).amountBaht, amountBaht);
        assert.ok(!/password|tokenHash|assignedReviewerId|requesterId/.test(JSON.stringify(body)), "Safe inherited detail projection");
      }
    });
  }
  test(`AC-L7-02 API ${operation}: preserved invalid types, categories and body shape`, async () => {
    const item = operation === "returned Save" ? await h.returned() : null;
    const baseline = await h.domain();
    const fields = { ...oldFields, ...(item ? { expectedRevision: item.revision } : {}) };
    for (const data of [
      ...[0, -1, 1.5, "100000", null, true, {}, [], undefined].map(amountBaht => ({ ...fields, amountBaht })),
      ...["UNKNOWN", "", null, undefined].map(category => ({ ...fields, category })),
      { ...fields, requesterId: "forged" }, { ...fields, status: "APPROVED" },
    ]) {
      const response = await h.req("owner", item ? `/${item.id}` : "", item ? "PATCH" : "POST", data);
      assert.equal(response.status, 400); assert.equal((await response.json()).error.code, "INVALID_INPUT");
      assert.deepEqual(await h.domain(), baseline);
    }
  });
}

test("AC-L7-05 API: preserved ordinary/TRAVEL authentication, role, ownership and Origin controls", async () => {
  const item = await h.returned({ ...oldFields, category: "TRAVEL", amountBaht: 100000 });
  const beforeState = await h.snapshot(item.id);
  const fields = { ...oldFields, category: "TRAVEL", amountBaht: 100000, expectedRevision: item.revision };
  for (const [actor, status, code] of [[undefined, 401, "UNAUTHENTICATED"], ["other", 404, "NOT_FOUND"], ["reviewer", 403, "FORBIDDEN"]] as const) {
    const response = await h.req(actor, `/${item.id}`, "PATCH", fields);
    assert.equal(response.status, status); assert.equal((await response.json()).error.code, code);
    assert.deepEqual(await h.snapshot(item.id), beforeState);
  }
  for (const suffix of [`/${item.id}`, `/${item.id}/resubmit`]) {
    const response = await h.req("owner", suffix, suffix.endsWith("resubmit") ? "POST" : "PATCH", suffix.endsWith("resubmit") ? { expectedRevision: item.revision } : fields, "https://untrusted.example");
    assert.equal(response.status, 403); assert.equal((await response.json()).error.code, "FORBIDDEN_ORIGIN");
    assert.deepEqual(await h.snapshot(item.id), beforeState);
  }
  assert.equal((await h.req("reviewer", "", "POST", oldFields)).status, 403);
  assert.equal((await h.req(undefined, "", "POST", oldFields)).status, 401);
  assert.equal((await h.req("other", `/${item.id}`)).status, 404);
  assert.equal((await h.req("outsider", `/${item.id}`)).status, 404);
});

test("AC-L7-04/05 API: ordinary state, stale revision and workflow/history controls", async () => {
  for (const terminal of [undefined, "APPROVED", "REJECTED"] as const) {
    const item = await h.create();
    if (terminal) assert.equal((await h.req("reviewer", `/${item.id}/decision`, "POST", { decision: terminal, ...(terminal === "REJECTED" ? { reason: "Synthetic final decision" } : {}), expectedRevision: 0 })).status, 200);
    const baseline = await h.snapshot(item.id);
    assert.equal((await h.req("owner", `/${item.id}`, "PATCH", { ...oldFields, expectedRevision: baseline.revision })).status, 409);
    assert.deepEqual(await h.snapshot(item.id), baseline);
  }
  const item = await h.returned(); const baseline = await h.snapshot(item.id);
  assert.equal((await h.req("owner", `/${item.id}`, "PATCH", { ...oldFields, expectedRevision: 0 })).status, 409);
  assert.deepEqual(await h.snapshot(item.id), baseline);
  const edited = await h.req("owner", `/${item.id}`, "PATCH", { ...oldFields, category: "TRAVEL", amountBaht: 100000, expectedRevision: 1 });
  assert.equal(edited.status, 200);
  assert.equal((await h.req("owner", `/${item.id}/resubmit`, "POST", { expectedRevision: 2 })).status, 200);
  assert.equal((await h.req("reviewer", `/${item.id}/decision`, "POST", { decision: "APPROVED", expectedRevision: 3 })).status, 200);
  const final = await h.snapshot(item.id);
  assert.equal(final.id, item.id); assert.equal(final.amountBaht, 100000); assert.equal(final.category, "TRAVEL"); assert.equal(final.revision, 4);
  assert.deepEqual(final.events.slice(0, 2), baseline.events);
  assert.deepEqual(final.events.map(x => x.type), ["SUBMITTED", "RETURNED", "EDITED", "RESUBMITTED", "APPROVED"]);
});

// Direct SQL probes always restore their savepoint before assertions or transaction completion.
async function probe(id: string, category: Category, amountBaht?: number) {
  return h.db.$transaction(async tx => {
    await tx.$executeRawUnsafe("SAVEPOINT lab7_pair_probe");
    let rows: number | null = null; let nativeCode: string | undefined;
    try {
      rows = amountBaht === undefined
        ? await tx.$executeRaw`UPDATE "ExpenseRequest" SET "category"=${category}::"ExpenseCategory" WHERE "id"=${id}`
        : await tx.$executeRaw`UPDATE "ExpenseRequest" SET "category"=${category}::"ExpenseCategory", "amountBaht"=${amountBaht} WHERE "id"=${id}`;
    } catch (e) { nativeCode = (e as { meta?: { code?: string } }).meta?.code; }
    finally { await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT lab7_pair_probe"); await tx.$executeRawUnsafe("RELEASE SAVEPOINT lab7_pair_probe"); }
    return { rows, nativeCode };
  });
}
for (const [category, amountBaht, accepted] of cases) {
  test(`AC-L7-06 STS-L7-08 SQL: ${category} ${amountBaht} ${accepted ? "permitted" : "CHECK rejected"}`, async () => {
    const item = await h.create(); const baseline = await h.snapshot(item.id);
    const outcome = await probe(item.id, category, amountBaht);
    assert.deepEqual(await h.snapshot(item.id), baseline, "Savepoint restored all prerequisite/domain state before policy assertion");
    assert.deepEqual(outcome, accepted ? { rows: 1, nativeCode: undefined } : { rows: null, nativeCode: "23514" }, "Actual PostgreSQL pair enforcement (23514 = CHECK violation)");
  });
}
test("AC-L7-06 SQL: ordinary category-only update control preserves old-range rows", async () => {
  const item = await h.create({ ...oldFields, amountBaht: 100000 }); const baseline = await h.snapshot(item.id);
  for (const category of ["TRAVEL", "EQUIPMENT", "ACTIVITY"] as const) assert.deepEqual(await probe(item.id, category), { rows: 1, nativeCode: undefined });
  assert.deepEqual(await h.snapshot(item.id), baseline);
});
test("AC-L7-06 SQL: newly permitted ACTIVITY125000 then category-only lower-cap update is rejected", async () => {
  const item = await h.create(); const baseline = await h.snapshot(item.id);
  await h.db.$transaction(async tx => {
    await tx.$executeRawUnsafe("SAVEPOINT lab7_category_chain");
    try {
      let rows: number | null = null; let nativeCode: string | undefined;
      try { rows = await tx.$executeRaw`UPDATE "ExpenseRequest" SET "category"='ACTIVITY',"amountBaht"=125000 WHERE "id"=${item.id}`; }
      catch (e) { nativeCode = (e as { meta?: { code?: string } }).meta?.code; }
      // This is the first new-behavior assertion, not a silently invalid high-value fixture.
      assert.deepEqual({ rows, nativeCode }, { rows: 1, nativeCode: undefined }, "Existing CHECK must first permit newly valid ACTIVITY125000; lower-cap category-only steps are unreached if it rejects");
      for (const category of ["EQUIPMENT", "TRAVEL"] as const) {
        await tx.$executeRawUnsafe("SAVEPOINT lab7_lower_cap");
        let rejected: string | undefined;
        try { await tx.$executeRaw`UPDATE "ExpenseRequest" SET "category"=${category}::"ExpenseCategory" WHERE "id"=${item.id}`; }
        catch (e) { rejected = (e as { meta?: { code?: string } }).meta?.code; }
        finally { await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT lab7_lower_cap"); await tx.$executeRawUnsafe("RELEASE SAVEPOINT lab7_lower_cap"); }
        assert.equal(rejected, "23514", "Changing category alone cannot bypass its amount limit");
      }
    } finally { await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT lab7_category_chain"); await tx.$executeRawUnsafe("RELEASE SAVEPOINT lab7_category_chain"); }
  });
  assert.deepEqual(await h.snapshot(item.id), baseline);
});
