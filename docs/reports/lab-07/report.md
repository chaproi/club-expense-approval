<!-- PDF page 1 /Cover -->
# Club Expense Approval
## Lab 7 - Software maintenance, metrics and readiness
**นายสิริกร ฝันนิมิตร / 67070507215 / TH-038**<br>
Solo with instructor permission. External peer review retains its actual attribution.

Repository: https://github.com/chaproi/club-expense-approval<br>
Deployed application: https://s981b09c9-4d7hbszvwq-as.a.run.app

Released main: **c259afe45eb49311c1f7bb9e166c4443041b9b82**<br>
Log-reported revision: **s981b09c9-00009-fwv**,100% traffic.

Report dated28November2026 (Asia/Bangkok). Due29November2026,23:59 Thailand. The original instructor-approval clause is superseded only by the student-supplied announcement; no personal instructor approval is invented.

**Owner-directed automated checks**, not external peer UAT. This packet is not a claim of final owner acceptance or LEB2 submission.

<table>
<thead>
<tr>
<th>Part</th>
<th>Weight</th>
<th>Actual PDF pages</th>
</tr>
</thead>
<tbody>
<tr>
<td>A</td>
<td>25</td>
<td><a href="#page-2">2-8</a></td>
</tr>
<tr>
<td>B</td>
<td>50</td>
<td><a href="#page-9">9-23</a></td>
</tr>
<tr>
<td>C</td>
<td>15</td>
<td><a href="#page-24">24-26</a></td>
</tr>
<tr>
<td>D</td>
<td>10</td>
<td><a href="#page-27">27-30</a></td>
</tr>
</tbody>
</table>


### Scope and current verdict
**READY for the bounded maintained functionality on the recorded evidence; owner final acceptance/submission is separate.**
F-06 category totals,F-07 two-stage approval and F-08 filtering remain **Planned**. No video or unchanged full SRS/application dump is included. The completed D2 packet is preserved separately.

---

<!-- PDF page 2 /A -->
## A1. Genuine maintenance of a Sprint1 rule
Accepted Sprint1 reference **43aa8d7472aa8852654d0d634d7239c3765c5869** enforced whole-baht1-100000 for every category. Actual pre-change source **453528073038a3122ecd7abb0adac7bf09a1dc41** has the same application bytes as previously deployed **cc6b04c8e98191be591a3b755d25988148523909**; later-sprint Return/Edit/Resubmit/count-only behavior coexists.

**OLD BR-01 assessed excerpt:**<br>
> รายการหลัง trim มี1-120ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม1-100,000บาท

**NEW accepted candidate BR-01:**<br>
> รายการหลัง trim มี1-120ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็มตั้งแต่1บาท โดย ACTIVITYไม่เกิน150,000บาท EQUIPMENTไม่เกิน120,000บาท และTRAVELไม่เกิน100,000บาท ต้องตรวจหมวดและยอดร่วมกัน

| Category | Inclusive integer range | Maximum+1 rejected |
|---|---|---|
| ACTIVITY | 1-150000 | 150001 |
| EQUIPMENT | 1-120000 | 120001 |
| TRAVEL | 1-100000 | 100001 |


125000 is valid only for ACTIVITY;110000 for ACTIVITY/EQUIPMENT but not TRAVEL. Unknown/empty categories have no fallback. Policy selected by the student, not by the instructor or an external financial authority.

## A2. Approval-waiver announcement - verbatim supplied evidence
> Announcement. Lab 7 Spec Sheet Change. You need not get Instructor or TA Approval for your change request to Sprint 1. Think of a good change to Sprint 1 among yourselves, but do try to make it a complex enough added feature and not just a trivial change.

Student supplied this text; recorded27November2026. Original publication date/URL and independent channel verification were not supplied. **Instructor/TA approval: Not required under updated instructor announcement**, not Approved. Peer contract review still preceded implementation.

---

<!-- PDF page 3 /A -->
## A3. Impact analysis and unchanged guarantees
| Requirement / feature | Affected contract and module | Impact / preserved guarantee |
|---|---|---|
| BR-01 / FR-02 / F-02 | SRS scope/BR-01; Feature SDS creation; expense-input.ts, expense-requests.ts, creation form | Validate known category+integer pair; accurate range400 feedback; same body/DTO/assignment/one SUBMITTED event. |
| BR-01 / FR-05 / F-05 | F-05 v1.1 API/UI; shared parser and returned-edit form | Same RETURNED owner/current revision; invalid pair400 changes no fields/time/revision/history. |
| BR-05/06 / AC-F05-07-11 | Existing draft reconciliation and BF-01 | Restore changed fields over latest; retain invalid mixed pair visibly; no auto write/clamp; manual correction/Save/Resubmit. |
| FR-01 / NFR-01 / BR-02/03 | auth.ts and inherited router guards | No auth/role/ownership/Origin/session/assignment/DTO protocol change; verify valid-pair denials. |
| BR-04/05/06 / NFR-02 | Conditional updates and atomic event transactions | Preserve races, stale/terminal denial, receipt-free existing workflow and old history. No concurrency/budget changes. |
| BR-01 / NFR-02 | System SDS named CHECK; one new migration | Transactional replacement; no old row/event rewrite, backfill, model/enum/type/index change. INTEGER supports150000. |
| FR-06 / count-only checkpoint | Existing assigned status summary | Counts use status/assignee scope, not ceiling. No count implementation change. Totals remain Planned. |
| Delivery / Issue49 | Lab5 pipeline and CI environment | Migrate before service update. CI-only owned target provisioning satisfies existing guards; no deployment/dependency change. |


## A4. Relevant revised Feature / System SDS
POST /api/expense-requests takes exactly title/category/amountBaht. Owner PATCH /:id takes those fields plus expectedRevision; Resubmit takes revision only. Valid creation201 starts revision0/one SUBMITTED; Save200 keeps RETURNED, increments once and adds one EDITED. Invalid pair400 INVALID_INPUT leaves authoritative state exact.

Both forms keep number/min1/step1/required and existing accessible names. Category changes retain amount, update max/linked feedback and prevent invalid submission. Restoring an amount over a newer lower category does not change user intent silently. Title Unicode/UTF-16 counting, draft lifecycle, read-only states and exact Origin remain inherited.

---

<!-- PDF page 4 /A -->
The following complete observable ACs are the accepted pre-implementation contract. Their original planning labels remain historical; current executions are mapped in PartB. Requirement IDs were not renumbered.

| AC | Required observable outcome | STS |
|---|---|---|
| AC-L7-01 | Both operations validate the pair:1,100000 and each category maximum accepted; maximum+1 rejected.110000/125000 produce category-dependent outcomes, not one uniform cap. Exact saved pair read back. | STS-L7-01/02/03/04 |
| AC-L7-02 | Invalid pair,0,negative,fractional,missing/non-number amount or unsupported category returns400 INVALID_INPUT with exact unchanged fields/timestamps/revision/history and no new rows/events. Existing title/body validation remains. | STS-L7-01/02 |
| AC-L7-03 | Both UI forms update max/feedback with category; lower-cap switch retains amount, exposes accessible error and sends no mutation; correction/switch-back restores validity. Native controls and backend independently enforce pair. | STS-L7-03/04 |
| AC-L7-04 | Explicit valid Save/Resubmit retain ID/assignment/old history, exact revision increments/atomic events. Invalid category switches/restored pairs never save automatically; conflict/recovery/BF-01 and stale/concurrent guards remain. | STS-L7-04/06/07 |
| AC-L7-05 | Session/role/ownership/Origin/status/revision restrictions and safe projections stay intact for valid proposed pairs; submitted/terminal requests remain read-only. | STS-L7-05/06/09 |
| AC-L7-06 | New CHECK validates pair on insert and amount-only/category-only update; fresh/populated migration preserves all old valid categories/rows/events, old migration checksums and restart readback. Rollback never rewrites larger values. | STS-L7-08/09 |
| AC-L7-07 | Original submit→approve/reject→owner history and current Return/Edit/Resubmit/draft/assigned-count paths remain; amount policy adds no totals/two-stage/filter behavior. | STS-L7-04/07/09 |
| AC-L7-08 | Revised contract peer-reviewed before implementation; later reviewed code/CI/staging/main/migration/deployment and changed/preserved synthetic checks record actual identities/results. Instructor/TA approval is Not required under updated instructor announcement. | STS-L7-10 |

No scope is moved into future Issues to excuse an incomplete maintenance requirement. Local, hosted and live coverage are distinguished later. AC-L7-08's release/submission acceptance is not inferred from source approval.

---

<!-- PDF page 5 /A -->
These are the actual accepted input/precondition/expected-result cases, versioned at c7f1c88 before test/code work. Status phrases such as future/unexecuted describe that design checkpoint; current results appear in PartB.

| STS | Preconditions / inputs / level | Independent expected results |
|---|---|---|
| STS-L7-01 | Unit parseExpenseInput/parseReturnedInput for each category:1,100000,max,max+1; cross-pair110000 and125000; invalid0,-1,1.5,string,null,boolean,object,array,missing amount/category,unknown category; NaN/Infinity unit only | Independently literal ACTIVITY150000/EQUIPMENT120000/TRAVEL100000 expectations, not deriving expected values from production map. Per-category max accepted;max+1 rejected; cross-pair matrix below. Preserve all title/category/body checks. New valid ACTIVITY/EQUIPMENT upper values fail on old production, while TRAVEL controls may already pass; report honestly. |
| STS-L7-02 | Authorized POST and current-revision PATCH RETURNED per-category max+1 and cross-pair invalid values; separate fresh fixtures and complete snapshots |400 INVALID_INPUT, safe truthful feedback and exact unchanged fields/updatedAt/revision/history; no new request/event. Numeric-only validation independent of browser. No expected state/auth denial inferred from an invalid pair. |
| STS-L7-03 | Real create form and real HTTP for all category boundaries. Start ACTIVITY125000→EQUIPMENT→TRAVEL→ACTIVITY; EQUIPMENT110000→TRAVEL→correct100000 | Max follows category; invalid pair retains amount/selected category, linked feedback, no POST on switch/invalid submission. Switching back/correcting restores valid form. Explicit create returns201 exact pair/revision0/one SUBMITTED; owner/assigned reads exact. Isolate HTTP positive assertions from deeper UI assertions on old code; no fabricated success. |

Source: docs/labs/lab-07/contract-proposed-v1.md at reviewedc7f1c88; original uniform proposal12d40ec preserved. No expected matrix derives its values from the new production helper.

---

<!-- PDF page 6 /A -->
These are the actual accepted input/precondition/expected-result cases, versioned at c7f1c88 before test/code work. Status phrases such as future/unexecuted describe that design checkpoint; current results appear in PartB.

| STS | Preconditions / inputs / level | Independent expected results |
|---|---|---|
| STS-L7-04 | Owned real returned records: apply same category-switch sequences in edit form; explicit Save/Resubmit. Two real sessions: draft changes amount to125000 while newer saved category becomesTRAVEL with valid old amount | Category-only invalid Save sends no browser PATCH; direct PATCH invalid→400/no state change. Stale valid draft PATCH→real409; latest/draft separate; Restore keeps latest untouchedTRAVEL and draft125000 visibly invalid, no write/clamp, Save blocked until user selects valid pair. Manual Save uses latest revision; one EDITED, then one RESUBMITTED. Keep BF-01 clean/no-difference behavior. |
| STS-L7-05 | Valid ACTIVITY150000/EQUIPMENT120000/TRAVEL100000 pairs with anonymous/revoked/wrong-role/foreign-owner/invalid-Origin actors; valid old-range controls | Inherited401 UNAUTHENTICATED,403 FORBIDDEN/FORBIDDEN_ORIGIN,404 hidden owner; no domain mutation/private response. Missing valid Reviewer assignment remains503/no insert. Preserve actual guard precedence; category policy must not obscure access checks. |
| STS-L7-06 | Valid pairs on SUBMITTED/APPROVED/REJECTED PATCH, stale RETURNED revision, overflow and same-revision concurrent edit/resubmit | State/stale409; exact unchanged rejected snapshots. Existing races retain exactly one200/one409 and one event. No timing/retry/concurrency/assertion relaxation; fresh and larger-value controls after GREEN. |

Source: docs/labs/lab-07/contract-proposed-v1.md at reviewedc7f1c88; original uniform proposal12d40ec preserved. No expected matrix derives its values from the new production helper.

---

<!-- PDF page 7 /A -->
These are the actual accepted input/precondition/expected-result cases, versioned at c7f1c88 before test/code work. Status phrases such as future/unexecuted describe that design checkpoint; current results appear in PartB.

| STS | Preconditions / inputs / level | Independent expected results |
|---|---|---|
| STS-L7-07 | Existing decision/old-round/revision/race, draft-recovery/BF-01 and browser journeys; high valid ACTIVITY/EQUIPMENT records plus unchangedTRAVEL | Original assertions/events retained; explicit decisions preserve exact category/amount; no Restore/category-selection write, no duplicate history. Report actual counts/failed/skipped at exact SHA, never assume old47/19. |
| STS-L7-08 | Fresh owned target plus separate populatedcc6b04c target containing all categories and old1/100000 boundaries across valid statuses/events; new migration only | Immediate pre/post domain snapshots exact; old migrations unchanged; actual CHECK validated. Direct insert and amount-only/category-only updates at per-category max/max+1 and cross-pair125000/110000 enforce same matrix; rollback invalid probes, preserve source snapshots. No API-only substitute. Inspect rollback incompatibility on owned data, never destructive narrowing. |
| STS-L7-09 | Before intentional writes, save old row/event snapshot; restart owned app/client after migration; unchanged auth/workflow/summary suites | Exact IDs/assignment/fields/timestamps/revisions/old events survive migration/restart. Separate intentional later workflow deltas. Scoped status counts unaffected by amount policy; original approve/reject and owner restrictions preserved. |
| STS-L7-10 | Future peer-reviewed revision/code/main/image, successful migration job, authorized synthetic live actors | Trace actual reviewed SHA/run/image/revision; selected category max/max+1/cross-pair/category-switch, returned Save and preserved decision/access checks. No shared reset/seed, no old CI relabelled, no instructor gate reintroduced. Current stage UNEXECUTED. |

Source: docs/labs/lab-07/contract-proposed-v1.md at reviewedc7f1c88; original uniform proposal12d40ec preserved. No expected matrix derives its values from the new production helper.

---

<!-- PDF page 8 /A -->
## A5. PR50 independent contract review
| Field | Verified value |
|---|---|
| Author / branch | chaproi / docs/lab7-amount-limit-proposal |
| Reviewer | thananun-7203 |
| Reviewed head | c7f1c88e0b3bc78322d1dcc34c9ceb4c397361eb |
| Approval UTC | 2026-11-27T06:11:30Z |
| Merge / UTC | 453528073038a3122ecd7abb0adac7bf09a1dc41 / 2026-11-27T07:05:24Z |


**Recorded decision summary:**

~~~text
APPROVE (substantive pre-implementation Lab7 contract review only; not implementation/release readiness)
~~~

The submitted six-axis review covered identity/history/announcement, bounded requirement scope/AC8/STS10, server/UI/DB consistency and preservation/rollback design, meaningful RED strategy, honest unexecuted status, and completeness. **No binding findings.**

Substantive implementation guidance: keep creation category/amount controlled so category changes preserve input and successful201 resets it; give truthful category-specific API messages; make restored lower-category/high-amount pairs visibly invalid with linked feedback and no Save. All three notes were addressed by the later implementation and reviewed again in PR51.

Chronology is objective: review c7f1c88 at06:11:30Z and merge4535280 at07:05:24Z preceded testsf08672d, RED17aba6f and sourceec10dd4. The earlier teacher-Pending and uniform150000 proposal remain historical, not current gates.

**Evidence A5:** full actual submitted review is embedded in packet review-chain.json; GitHub review6084244796. The short decision wording above is a labelled summary, not a new approval.

---

<!-- PDF page 9 /B -->
## B1. Immutable evidence sequence
| Stage | Actual source / outcome |
|---|---|
| Accepted Sprint1 | 43aa8d7472aa8852654d0d634d7239c3765c5869; Lab6 acceptance applies to this version only. |
| Pre-change | 453528073038a3122ecd7abb0adac7bf09a1dc41; app bytes match deployedcc6b04c. |
| Tests / RED | f08672dda573907cba0ef686c5d80e74f81a53e2 before code; evidence17aba6f.116 focused executions:87pass/29semantic fail/0skip. |
| Implementation | ec10dd44140ee41f41826763c1500097d9b626e9;3 source files+1 new migration. |
| Supplementary checks | a0d1e9d; extra54SQL/security cases and populated worker. Not retrospective RED. |
| Image helper / evidence | d406cb8 helper;48608e2 GREEN record. No later publication-HEAD relabelling. |
| CI adaptation / code review | b7cbdd1552f0cd0c3c818bb478c467577b1b44a1; PR51 approval19:02:13Z27Nov; stagingcc4b732 at19:38:24Z. |
| Release review / merge | PR52 reviewedcc4b732; approval28Nov05:26:51Z; merged mainc259afe45eb49311c1f7bb9e166c4443041b9b82 at07:15:32Z. |
| Deployment | Existing run46120371207, revision00009-fwv; no duplicate deployment. |


The three reviewed/tested/staging trees share hash5fcc7cc7fe7fc8c66ccce4d3dc57d542490b0007. PR51 checkouteee3f1b and PR52 checkout5207814 are distinct test-merge commits; actual-main CI now testsc259afe exactly.

Legitimately superseded negatives only: EQUIPMENT100001-invalid became120001-invalid; ACTIVITY100001-invalid became150001-invalid. New positive/cross-category cases supplement them; TRAVEL100001 and unrelated negatives remain. Frozen RED assertions/helpers are byte-preserved through GREEN.

---

<!-- PDF page 10 /B -->
## B2. Independent policy fixture and assertion - exact test excerpt
File server/test/expense-input.test.ts, committedf08672d before production changes. Current interfaces only; no missing-helper or compile-error RED.

~~~typescript
// Literal expected policy, intentionally independent of all production constants.
const policyCases = [
  ["ACTIVITY", 1, true], ["ACTIVITY", 150000, true], ["ACTIVITY", 150001, false],
  ["EQUIPMENT", 1, true], ["EQUIPMENT", 120000, true], ["EQUIPMENT", 120001, false],
  ["TRAVEL", 1, true], ["TRAVEL", 100000, true], ["TRAVEL", 100001, false],
  ["ACTIVITY", 125000, true], ["EQUIPMENT", 125000, false], ["TRAVEL", 125000, false],
  ["ACTIVITY", 110000, true], ["EQUIPMENT", 110000, true], ["TRAVEL", 110000, false],
] as const;
for (const parser of ["creation", "returned Save"] as const) {
  for (const [category, amountBaht, accepted] of policyCases) {
    test(`AC-L7-01/02 STS-L7-01 unit ${parser}: ${category} ${amountBaht} ${accepted ? "accepted" : "rejected"}`, () => {
      const fields = { ...base, category, amountBaht };
      const actual = parser === "creation" ? parseExpenseInput(fields) : parseReturnedInput({ ...fields, expectedRevision: 7 }, true);
      assert.deepEqual(actual, accepted ? parser === "creation" ? fields : { expectedRevision: 7, fields } : null);
    });
  }
~~~

**Actual RED command:** node --import tsx --test server/test/expense-input.test.ts<br>
TestsSHAf08672d; unchanged production4535280. Output:

~~~text
ℹ tests 34
ℹ suites 0
ℹ pass 24
ℹ fail 10
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 445.5897

✖ AC-L7-01/02 STS-L7-01 unit creation: ACTIVITY 150000 accepted (3.0998ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected

  + null
  - {
  -   amountBaht: 150000,
  -   category: 'ACTIVITY',
  -   title: 'Club supplies'
  - }

      at TestContext.<anonymous> (<WORKTREE>\server\test\expense-input.test.ts:49:14)
      at Test.runInAsyncScope (node:async_hooks:228:14)
      at Test.run (node:internal/test_runner/test:1118:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:787:18)
      at Test.postRun (node:internal/test_runner/test:1247:19)
      at Test.run (node:internal/test_runner/test:1175:12)
~~~

**Same test GREEN:** 34/34,0fail/skip at cleanec10dd4; runner226.2607ms. The overall RED stage also executed API51(35pass/16fail), browser4(1pass/3fail) and inherited27/27.29 failures were semantic, with successful fixtures/collection; not116 unique new tests.

---

<!-- PDF page 11 /B -->
## B3. Actual CHECK probe with valid prerequisites
Fixture: guard verifies owned loopback database/role/public schema; real authenticated old-range250-baht creation. Probe uses savepoint rollback before independent policy assertion.

~~~typescript
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
~~~

On old migrated database,5 newly permitted pairs returned native23514 instead of one affected row; the category-only chain stopped at its first ACTIVITY125000 assertion. No future migration file was required for collection. Unit/API/browser failures and unreached statements were individually recorded.

**GREEN:** all51 original API/SQL cases pass at ec10dd4. The high pair succeeds, so EQUIPMENT/TRAVEL category-only rejection checks now execute. Supplemental54 at a0d1e9d add INSERT/amount-only/category-only, literal pairs, high-value access/race/revoked checks.

Browser4/4 at ec10dd4 now reaches actual stale409, latest TRAVEL100000 versus draft125000, Restore retaining invalid TRAVEL125000, linked feedback/no write, explicit correction/manual Save with newest revision and Resubmit/history. Full23 includes inherited draft lifecycle, GET-only retry, repeated conflict, transport-failure simulations and both BF-01 tests. Simulated transport tests are not live outage evidence.

---

<!-- PDF page 12 /B -->
## B4. Shared creation / returned parser
Actual ec10dd4 diff excerpt; no auth/revision/transaction implementation changes.

~~~diff
diff --git a/server/src/expense-input.ts b/server/src/expense-input.ts
index b3167f5..d9859cb 100644
--- a/server/src/expense-input.ts
+++ b/server/src/expense-input.ts
@@ -3,12 +3,28 @@ import { ExpenseCategory } from "@prisma/client";
 // Unicode mode matches unpaired surrogates while allowing valid surrogate pairs.
 const invalidText = /[\0\uD800-\uDFFF]/u;

+const categoryCeilings = { ACTIVITY: 150_000, EQUIPMENT: 120_000, TRAVEL: 100_000 } as const;
+
+function amountCeiling(category: unknown) {
+  return typeof category === "string" && Object.hasOwn(categoryCeilings, category)
+    ? categoryCeilings[category as keyof typeof categoryCeilings] : undefined;
+}
+
+export function expenseValidationMessage(body: unknown) {
+  const category = body && typeof body === "object" ? (body as Record<string, unknown>).category : undefined;
+  const ceiling = amountCeiling(category);
+  return ceiling === undefined
+    ? "Enter a title of 1–120 characters and select Activity, Equipment or Travel with a whole-baht amount."
+    : `Enter a title of 1–120 characters and a whole amount of 1–${ceiling.toLocaleString("en-US")} baht for ${category}.`;
+}
+
 export function parseExpenseInput(body: unknown) {
   if (!body || typeof body !== "object" || Object.keys(body).length !== 3) return null;

   const { title, category, amountBaht } = body as Record<string, unknown>;
+  const ceiling = amountCeiling(category);
   if (typeof title !== "string" || typeof amountBaht !== "number" ||
-      !Number.isInteger(amountBaht) || amountBaht < 1 || amountBaht > 100_000 ||
+      ceiling === undefined || !Number.isInteger(amountBaht) || amountBaht < 1 || amountBaht > ceiling ||
       !Object.values(ExpenseCategory).includes(category as ExpenseCategory)) return null;

   const trimmedTitle = title.trim();
~~~

Router message changes import expenseValidationMessage, replace the old uniform100000 creation message, and append truthful range feedback to returned-Save invalid input. API shapes/codes are unchanged. Full raw diff is in implementation-diff.json; implementation.diff is its whitespace-normalized print copy. No unrelated app/schema/dependency change is hidden.

Object.hasOwn prevents prototype/unknown category keys from obtaining a maximum. Numeric JSON integer validation, title length/trim/invalid text and body-shape checks remain inherited.

---

<!-- PDF page 13 /B -->
## B5. Actual released UI excerpts

~~~tsx
function amountPolicy(category: string, amount: string) {
  const known = Object.hasOwn(categoryCeilings, category);
  const ceiling = known ? categoryCeilings[category as keyof typeof categoryCeilings] : undefined;
  const number = Number(amount);
  return {
    ceiling,
    valid: ceiling !== undefined && Number.isInteger(number) && number >= 1 && number <= ceiling,
    message: ceiling === undefined ? "Select a category to see its whole-baht range."
      : `${categoryLabels[category as keyof typeof categoryLabels]}: enter a whole amount from 1 to ${ceiling.toLocaleString("en-US")} baht.`,
  };
}
~~~

Creation selection/amount are local state and reset after successful201. Pending controls remain unavailable during writes. Category changes update only the category state, never mutate or clamp the amount.

Returned Save guard and linked invalid feedback:

~~~tsx
  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail || !editable || !values || !dirty || !editAmountPolicy.valid) return;
    void mutate("save", { ...values, amountBaht: Number(values.amountBaht) }, captureDraft(detail, values));
  }
~~~

Nonadjacent returned-form JSX excerpt from the same released file:

~~~tsx
                <p><label htmlFor="expense-edit-category">Corrected category</label>{" "}<select id="expense-edit-category" name="editCategory" value={values.category} onChange={event => changeEdit({ ...values, category: event.currentTarget.value as Expense["category"] })} disabled={pending}>
                  {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></p>
                <p><label>Corrected amount (baht) <input name="editAmount" type="number" min="1" max={editAmountPolicy.ceiling} step="1" value={values.amountBaht} onChange={event => changeEdit({ ...values, amountBaht: event.currentTarget.value })} required disabled={pending} aria-describedby="expense-edit-limit" aria-invalid={!editAmountPolicy.valid || undefined} /></label></p>
                <p id="expense-edit-limit" role={!editAmountPolicy.valid ? "alert" : undefined}>{editAmountPolicy.message}</p>
                <button type="submit" disabled={pending || !dirty || !editAmountPolicy.valid}>Save changes</button>
              </form>
              {dirty && <p role="status">Save your changes before resubmitting.</p>}
              <button type="button" disabled={pending || dirty} onClick={() => void mutate("resubmit", {})}>Resubmit request</button>
              {draft?.restored && <button type="button" disabled={pending} onClick={discardDraft}>Discard draft</button>}
~~~

Same draft functions captureDraft, stageRestoredDraft, restoreDraft, discardDraft and changeEdit are unchanged; same-value Restore/reversion still clears phantom drafts. Successful Save/Resubmit clears only the selected request draft under existing lifecycle rules. Native validity and explicit handler guards protect invalid pairs independently of backend validation.

**No automatic write:** selection/Restore/Discard/retry do not mutate. Dirty Resubmit stays disabled. Browser assertions observe actual requests; no business response was fabricated.

---

<!-- PDF page 14 /B -->
## B6. Complete new migration - exact released SQL

~~~sql
BEGIN;

LOCK TABLE "ExpenseRequest" IN ACCESS EXCLUSIVE MODE;

-- Fail closed if the inherited named CHECK is missing, unvalidated or changed.
DO $$
DECLARE old_definition TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO old_definition
  FROM pg_constraint
  WHERE conrelid = '"ExpenseRequest"'::regclass
    AND conname = 'ExpenseRequest_amountBaht_check' AND contype = 'c' AND convalidated;
  IF old_definition IS DISTINCT FROM 'CHECK ((("amountBaht" >= 1) AND ("amountBaht" <= 100000)))' THEN
    RAISE EXCEPTION 'Unexpected pre-change expense amount CHECK; migration stopped';
  END IF;
END $$;

ALTER TABLE "ExpenseRequest" DROP CONSTRAINT "ExpenseRequest_amountBaht_check";
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_amountBaht_check"
CHECK (
  ("category" = 'ACTIVITY' AND "amountBaht" BETWEEN 1 AND 150000)
  OR ("category" = 'EQUIPMENT' AND "amountBaht" BETWEEN 1 AND 120000)
  OR ("category" = 'TRAVEL' AND "amountBaht" BETWEEN 1 AND 100000)
);

-- No row/event rewrites. Do not restore the old CHECK over newly valid larger rows.
COMMIT;
~~~

All3 applied files and Prisma schema/INTEGER/enum/indexes remain unchanged. The old validated constraint definition is checked before replacement under the same transaction/lock. Every formerly valid record remains valid because each new cap is at least100000; no backfill or domain rewrite.

Rollback cannot safely restore the old CHECK while larger values exist. Never delete/clamp data to make rollback succeed. Reviewed forward correction is preferred; app-only rollback retains data but loses high-value creation/edit capability. A narrowing data policy requires separate review. No destructive rollback was executed.

---

<!-- PDF page 15 /B -->
## B7. Actual local and hosted results - distinct sources
| Source | Actual counts / result |
|---|---|
| RED f08672d /17aba6f | Unit24/34;API35/51;browser1/4;inherited27/27.29 semantic fail,0skip. Earlier failed/unreached evidence retained. |
| GREEN ec10dd4 | Same unit34/API51/browser4 all pass; earlier blocked SQL/browser assertions execute. |
| Supplementary a0d1e9d | Additional54/54;full184/184 unit/API;23/23browser;types/build/Docker pass;0fail/skip. |
| PR51 testedeee3f1b | Run45978536607:184/23pass,migrations4,build/Docker pass. |
| PR52 tested5207814 | Run46103018541:184/23pass,migrations4,build/Docker pass. |
| Exact mainc259afe | Run46120371207 ci/verify:184/23pass,migrations4,build/Docker pass. Details next pages. |


## B8. Populated upgrade - historical owned database, not live preservation
Actual pre-change4535280 application created24 requests/42events across3categories,1/100000 boundaries and SUBMITTED/RETURNED/APPROVED/REJECTED. Before intentional writes, candidate migration preserved exact IDs/assignment/fields/timestamps/revisions/events and private auth snapshots;3 old migration checksums unchanged.

Then6 old SUBMITTED records traversed Return/maximum Save/Resubmit/Approve: final24requests/66events;12 old terminal records and6 old RETURNED records unchanged. Assigned counts0/6/12/6, unassigned zeros, high-value guards and new app/Prisma/HTTP readback passed.

Image builtoa0d1e9d contained4 real migrations with matching hashes. Actual image migration/seed/HTTP workflow via helperd406cb8 passed, with3requests/15events and cleanup. This was a separate owned target; it does not prove live Cloud SQL preservation or a pre-deployment snapshot comparison. Private files never enter Git.

---

<!-- PDF page 16 /B -->
## B9. Substantive peer review and disposition
| Field | Actual verified metadata |
|---|---|
| Author / head | chaproi / feat/lab7-category-limits |
| Reviewer | thananun-7203 |
| Reviewed exact head | b7cbdd1552f0cd0c3c818bb478c467577b1b44a1 |
| Decision / UTC | APPROVED / 2026-11-27T19:02:13Z |
| Merged / UTC | cc4b732cc6709cfdc400033403c3b8815538baf1 / 2026-11-27T19:38:24Z |


The submitted six-axis review independently covered identity/provenance, bounded requirement scope, correctness/security/migration, actual tests/evidence, truthful status documentation and completeness. **Binding findings: None.**

PR51 verified the4 production/migration paths, no protected-file drift, actual CASE/CHECK parity, prototype-safe category validation, linked UI range feedback, restored invalid draft guard and unchanged BF-01. It assessed the job-owned CI target rather than weakening guards. The reviewer independently ran build and43 pure unit/canonical-origin cases; these reviewer checks retain their attribution and are not our exact-main suite.

**Non-blocking release note:** inspect the actual live named CHECK when authorized direct access exists, and separately record actual main, migration execution, revision/digest/traffic/live checks. Preparation disclosed direct access unavailable. No local result was relabelled as live. Deployment success now supplies execution/revision evidence; direct SQL/revision-digest reads remain unavailable.

The packet review-chain.json retains all actual submitted review text/URLs. No new reviewer request, message or self-approval was sent during report preparation.

---

<!-- PDF page 17 /B -->
## B9. Substantive peer review and disposition
| Field | Actual verified metadata |
|---|---|
| Author / head | chaproi / staging/sprint-2 |
| Reviewer | thananun-7203 |
| Reviewed exact head | cc4b732cc6709cfdc400033403c3b8815538baf1 |
| Decision / UTC | APPROVED / 2026-11-28T05:26:51Z |
| Merged / UTC | c259afe45eb49311c1f7bb9e166c4443041b9b82 / 2026-11-28T07:15:32Z |


The submitted six-axis review independently covered identity/provenance, bounded requirement scope, correctness/security/migration, actual tests/evidence, truthful status documentation and completeness. **Binding findings: None.**

PR52 independently verified the staging/reviewed tree identity,12ahead/0behind main, full128-path scope, unchanged protected deploy/dependency/schema/prior-migration files and migration-before-service ordering. It assessed fresh release CI184/23 and the qualified local populated/image evidence. The reviewer independently ran build,43pure-unit tests and both audits; those are reviewer evidence, not executions performed for this packet.

The release approval authorized the main-release review decision only. Main mergec259afe and existing deployment46120371207 happened afterward. The peer did not issue a new independent live UAT or final Lab7 submission acceptance.

The packet review-chain.json retains all actual submitted review text/URLs. No new reviewer request, message or self-approval was sent during report preparation.

---

<!-- PDF page 18 /B -->
## B10. Named complete suite on the released main
Run46120371207, job140903331799, ci/verify. Checkout and git log identify **c259afe45eb49311c1f7bb9e166c4443041b9b82**, not a PR merge. Commands: npm ci; npm run db:migrate; npm test; npm run build; npm run test:e2e; docker build.

~~~text
## MAIN-UNIT | actual original log excerpts
2026-11-28T07:16:07.7993183Z ℹ tests 184
2026-11-28T07:16:07.7994083Z ℹ pass 184
2026-11-28T07:16:07.7994407Z ℹ fail 0
2026-11-28T07:16:07.7994752Z ℹ cancelled 0
2026-11-28T07:16:07.7995103Z ℹ skipped 0
2026-11-28T07:16:07.7995821Z ℹ duration_ms 5252.856194

## MAIN-BROWSER | actual original log excerpts
2026-11-28T07:16:35.9619086Z Running 23 tests using 1 worker
2026-11-28T07:17:23.0224366Z   23 passed (53.3s)

## MAIN-BUILD | actual original log excerpts
2026-11-28T07:16:07.9296570Z > tsc --noEmit && tsc -p tsconfig.server.json && vite build
2026-11-28T07:16:11.4793367Z vite v7.3.7 building client environment for production...
2026-11-28T07:16:12.3248515Z ✓ built in 822ms
~~~

Collected/executed184,passed184,failed0,skipped0,cancelled0; test runner5252.856194ms. Browser23pass,0fail/skip,53.3s. Full output inventories are retained in exact-main-unit-output.log and exact-main-browser-output.log. JobsJSON confirms every required step succeeded, including post-job service cleanup.

This new main execution is separate from local a0d1e9d, PR51eee3f1b and PR525207814. The report task did not rerun local passing suites or trigger another deployment. CI's ephemeral target satisfied the unchanged guard; GITHUB_ENV exports matched its database/role/public schema before migrations.

---

<!-- PDF page 19 /B -->
## B11. Existing pipeline completed successfully
| Identity | Observed value |
|---|---|
| Main | c259afe45eb49311c1f7bb9e166c4443041b9b82 |
| Run | 46120371207 / attempt1 |
| Migration execution | s981b09c9-migrate-b9khk |
| Migration completion / service step start UTC | 07:19:49.735 /07:19:49.876 on28Nov |
| Revision / reported traffic | s981b09c9-00009-fwv /100% |
| Pushed registry digest | sha256:4f5d6c40bafbbf959c27aea5541aef76a6d2a17400c733e209338aaafe9455c2 |
| Image tag | s981b09c9:c259afe45eb49311c1f7bb9e166c4443041b9b82 |
| Application origin | https://s981b09c9-4d7hbszvwq-as.a.run.app |


~~~text
## DEPLOY-MIGRATION | actual original log excerpts
2026-11-28T07:19:11.3610357Z gcloud run jobs execute "$MIGRATE_JOB_NAME" --region "$REGION" --project "$PROJECT_ID" --wait
2026-11-28T07:19:11.3643972Z   MIGRATE_COMMAND: npm run db:migrate
2026-11-28T07:19:17.3937674Z Creating execution...
2026-11-28T07:19:48.6280776Z Running execution...............................................................................done
2026-11-28T07:19:49.7350443Z Execution [s981b09c9-migrate-b9khk] has successfully completed.

## DEPLOY-SERVICE | actual original log excerpts
2026-11-28T07:19:49.8772391Z   IMAGE: asia-southeast1-docker.pkg.dev/cpe-se-course-2026/s981b09c9/s981b09c9:c259afe45eb49311c1f7bb9e166c4443041b9b82
2026-11-28T07:20:05.2030318Z Service [s981b09c9] revision [s981b09c9-00009-fwv] has been deployed and is serving 100 percent of traffic.
2026-11-28T07:20:05.2030988Z Service URL: https://s981b09c9-670075229477.asia-southeast1.run.app
~~~

**Evidence source:** GitHub deployment logs. The registry digest is a pushed digest, not a directly resolved serving-revision digest. No authorized local gcloud/SQL connection was available; no direct Cloud Run revision/traffic/SQL query is claimed.

Exact-main CI identifies all four migrations, including the category-limit migration. Actual CI log excerpt (not production job stdout):

~~~text
2026-11-28T07:16:02.3915546Z Applying migration `20261127000000_category_amount_limits`
2026-11-28T07:16:02.3972131Z All migrations have been successfully applied.
~~~

The production job used the same main-tagged image and completed before service update. Runtime job Prisma stdout/applied rows were not directly available; the live CHECK was not queried. These are deployment-log observations, not direct cloud reads.

---

<!-- PDF page 20 /B -->
## B12. Owner-directed public browser/HTTP results
| Case | Precondition / expected | Actual |
|---|---|---|
| L7-P01 | Anonymous desktop root/login | HTTP200 and real login form PASS |
| L7-P02 | Anonymous me/list/summary | All401 UNAUTHENTICATED,safe envelope PASS |
| L7-P03 | 390x844 mobile login | Readable/reachable login,scrollWidth390=viewport390 PASS |


Executed28Nov07:22:45-07:22:56Z with Chromium151.0.7922.34 against the stated origin after successful deployment. Owned browser/context closed. These are real automated browser observations, not manual testing, Narrator audio or external independent UAT.

<img src="ASSET/public-login-desktop.png" class="screen compact" alt="Live anonymous login desktop">
<img src="ASSET/public-login-mobile.png" class="screen compact" alt="Live anonymous login mobile">
<p class="caption">B12-1/2: actual public application captures; synthetic/public state only. Desktop1440x1000 and mobile390x844. Capture timestamps and runtime in public-checks.json.</p>

---

<!-- PDF page 21 /B -->
## B13. Selected changed/preserved checks
| Case | Requirement / expected live observation | Status |
|---|---|---|
| L7-A01 | RealR1/R2/V1/two-session login;existing authorized snapshots | PASS |
| L7-A02 | All3 category maxima saved/retrieved exact | PASS |
| L7-A03 | Max+1/cross-category rejected,no domain writes | PASS |
| L7-A04 | UI switch retains amount,feedback,no auto write | PASS |
| L7-A05 | Important role/owner/Origin/state/revision denial | PASS |
| L7-A06 | Preserved approve/reject/reason/owner history | PASS |
| L7-A07 | Real409→latest/draft→invalidRestore→manualSave/Resubmit | PASS |
| L7-A08 | Reload/readback;authorized old samples unchanged | PASS |


| Retained synthetic ID | Category / amount | Final state / revision |
|---|---|---|
| 5946ce6a-9909-4c41-8149-32f164a87b81 | ACTIVITY /150000 | APPROVED /1 |
| 38a6c4ce-4e03-491d-8d3a-a08e42d9fb2f | EQUIPMENT /120000 | REJECTED /1 |
| aca6d08c-f6e5-4847-802c-d88d7cf7ad15 | TRAVEL /100000 | SUBMITTED /0 |
| 9629ba59-e4c6-4cb4-88ba-eaee7795fb35 | EQUIPMENT /110000 | SUBMITTED /0 |
| 37c48111-b1c2-4aaa-a142-34b85406c17e | ACTIVITY /150000 | APPROVED /5 |


New records are labelled UAT-L7 and retained. No reset/seed/delete or real-record alteration. Existing authorized snapshots were captured after deployment, before continuation writes, and compared afterward; this is preservation during our checks only, not a pre-deployment comparison. Roles/preconditions/time/expected/actual and HTTP redaction are in live-checks.json. Owned sessions logged out and contexts closed.

---

<!-- PDF page 22 /B -->
## B14. Actual live UI captures - selected synthetic record only
<div style="display:flex;gap:5mm;align-items:flex-start"><div style="width:39%"><img src="ASSET/live-create-form-crop.png" style="width:100%" alt="Category change retains invalid 125000 amount"><p class="caption">Creation: TRAVEL retains125000, linked100000 ceiling feedback and disabled Submit. No automatic write.</p></div><div style="width:59%"><img src="ASSET/live-restored-detail-crop.png" style="width:100%;max-height:208mm;object-fit:contain" alt="Restored invalid Travel150000 with disabled Save and Resubmit"><p class="caption">Real stale409 then Restore: latest TRAVEL100000 remains saved; draft amount150000 is retained and invalid. Save/Resubmit disabled until explicit correction.</p></div></div>

These are lossless crops of actual masked screenshots, not regenerated UI. Source images, timestamps, crop coordinates and hashes are retained. Unrelated request cards were masked at capture. Capture sizes1440x1000; full-page originals retained.

---

<!-- PDF page 23 /B -->
## B15. Real final readback and preserved first attempt
<div style="display:flex;gap:6mm;align-items:flex-start"><img src="ASSET/live-final-detail-crop.png" style="width:57%;max-height:207mm;object-fit:contain" alt="Final approved150000 record and six history events"><div style="width:41%">

The recovery record ends APPROVED, ACTIVITY150000, revision5. Exact six events: SUBMITTED, RETURNED, EDITED (second owner session), EDITED (explicit manual correction), RESUBMITTED, APPROVED.

The first attempt passed A01-A03, then failed A04's unsupported exact Category locator before a browser mutation. Four records were retained; four sessions logged out204. This was a harness error, not policy RED.

Continuation reused the four records and inherited /^Category/ combobox selector. It executed A01 and A04-A08: six passing cases; A02/A03 remain original passing observations, not reruns. All eight selected case requirements now have passing evidence. Original failure and both runners are preserved.

Six actor-specific snapshot comparisons cover three distinct pre-existing records. They were captured before continuation writes and unchanged afterward. No pre-deployment snapshot claim.

</div></div>

---

<!-- PDF page 24 /C -->
## C1. Definitions, fixed window and values
Repository: chaproi/club-expense-approval only. Common window: **27 November2026 00:00+07 (26 November17:00Z) through28 November07:22:14.1862118Z**. This is a fixed snapshot, not submission time. Later defect-status corroboration retains its actual read time; version-specific retest attribution remains explicit.

| Metric | Definition / actual value | Source / qualification |
|---|---|---|
| M1 Completed Issues | 6 completed:0 Lab7,6 other project. No duplicate/cancelled closure counted. | #34/#35/#36/#37/#42/#44, each completed within the window. Issue49 stays open. Full list on page25. |
| M2 Merged PRs | 3 Lab7 PRs:2 to staging,1 to main. No unrelated merge in window. | PR50/51/52 are three PR activities, not three different completed features. Full list on page25. |
| M3 Automated suite | npm test at exact main c259afe:184 collected/executed/passed;0 failed/skipped/cancelled. | Run46120371207, ci/verify. Actual summary on page18. Browser23 is separate; not207 unit/API. |
| M4 Defect status | 8 known records:6 resolved,2 deferred Low. Severity:1 High,3 Medium,3 Low,1 unclassified. | Version-specific register on page28. No binding finding in three submitted Lab7 reviews; not zero undiscovered/live defects. |
| M5 CI outcomes | 5 run-attempts:5 success;0 failed/cancelled/timed-out/other/running. Completed success5/5=100%. | Proposal, implementation, release and main run inventory on page26. Reusable jobs are not extra workflow runs. |

GitHub pagination read52 Issue/PR entries,29 PRs and45 workflow runs, ending below100 per page. Compact source lists are embedded on pages25-26 and retained in metrics-source.json. Earlier29 semantic RED failures and setup failures remain distinct from CI outcomes and are not erased by these values.


---

<!-- PDF page 25 /C -->
## C2. Completed Issues -6 (all other project work)
| Issue | Closed UTC / reason | Scope |
|---|---|---|
| 44 | 2026-11-26T17:18:33Z /completed | other project |
| 42 | 2026-11-26T17:18:31Z /completed | other project |
| 37 | 2026-11-26T17:18:29Z /completed | other project |
| 36 | 2026-11-26T17:18:26Z /completed | other project |
| 35 | 2026-11-26T17:18:25Z /completed | other project |
| 34 | 2026-11-26T17:18:23Z /completed | other project |


The UTC26Nov closures are inside the window because27Nov00:00Bangkok=26Nov17:00Z. Issue49 stays open; no closure was performed to inflate a metric.

## C3. Merged PRs -3
| PR / target | Merged UTC | Merge SHA prefix |
|---|---|---|
| 52 /main | 2026-11-28T07:15:32Z | c259afe45eb4 |
| 51 /staging/sprint-2 | 2026-11-27T19:38:24Z | cc4b732cc670 |
| 50 /staging/sprint-2 | 2026-11-27T07:05:24Z | 453528073038 |




---

<!-- PDF page 26 /C -->
## C4. Workflow attempts -5
| Run / attempt | Scope / head | Outcome |
|---|---|---|
| 46120371207/1 | main /c259afe | success |
| 46103018541/1 | staging/sprint-2 /cc4b732 | success |
| 45978536607/1 | feat/lab7-category-limits /b7cbdd1 | success |
| 45876424340/1 | docs/lab7-amount-limit-proposal /c7f1c88 | success |
| 45874483795/1 | docs/lab7-amount-limit-proposal /12d40ec | success |


**Interpretation (at most100 words; actual word count checked):**
Three reviewed PRs and five successful workflows connect the contract to deployment. Six completed Issues are unrelated closures, not Lab7 completion. Exact-main184/23 results and selected live checks passed; the initial locator failure remains preserved. Direct cloud observations and pre-deployment preservation are still limited. Owner chaproi will retain the private handoff outside Git and review the recorded limitations before the final submission decision, while carrying deferred Low observations into December hardening.


---

<!-- PDF page 27 /D -->
## D1. Maintained Sprint1 functionality - READY on bounded technical evidence

| Readiness item | Actual state / owner action |
|---|---|
| Rule / contract / peer review | PASS: PR50/51/52 reviewed; tests-first RED then GREEN; category policy agrees across all three layers. Instructor gate waived by recorded announcement. |
| Exact-main regression / deployment | PASS:184 unit/API and23 browser; four migrations, build/Docker; migration job completed before service update. Log-reported revision00009-fwv. |
| Changed / preserved live checks | PASS: three public cases and eight selected authenticated case requirements. First locator failure preserved; continuation executes six cases and reuses two original passes. |
| Live identity / preservation limits | Revision/traffic from deploy logs; registry digest is not a direct revision digest. No direct SQL. Six actor-read comparisons cover three distinct existing records during continuation only. |
| Configuration / runbook | Existing secrets, Origin and deployment workflow unchanged. Only authorized synthetic records created; no seed/reset/delete. |
| Final owner decision / submission | Separate and not performed. Scope readiness is not whole-product completion: F-06 totals/F-07/F-08 remain Planned. |



---

<!-- PDF page 28 /D -->
## D2. Defects - known records, not an undiscovered-defect count

| ID / source | Severity / status | Version-specific resolution or limitation |
|---|---|---|
| DEF-TH038-01 / #30 | Medium / resolved | Malformed-email500 fixed/retested at43aa8d7; original Lab6 peer acceptance only. Main unit/auth regression retained. |
| DEF-TH038-02 / #31 | Medium / resolved | Alias/Origin correction; original308/canonical-login retest at43aa8d7. Not new peer UAT on c259afe. |
| #42 (F-05 draft loss) | Medium / resolved technical | Real409 draft retention fixed at ffefb2d; BF-01 follow-up cb05d62; reviewed release cc6b04c. Exact-main23 includes recovery. |
| Save error wording (no historical ID) | Low / resolved technical | Action-specific Save error corrected in Issue42; transport tests retained. No historical ID invented. |
| BF-01 / PR43 review | Not assigned / resolved | Phantom clean draft fixed at cb05d62; approved f487956. Both tests pass in exact-main suite. |
| #44 advisory remediation | High (advisory basis) / resolved | Scoped overrides at a6c93ab, reviewed PR45. Prisma6.19.3 retained; compatibility debt remains. |
| OBS-TH038-01 | Low / deferred | Cross-tab authenticated UI can remain after other-tab logout; backend denial enforced. No new fix claimed. |
| OBS-TH038-02 | Low / deferred | UTF-16 title counting discrepancy retained. No Unicode-contract change. |


Resolved requires a recorded fix and relevant retest, not closed status alone. Issue30/31/42/44 are completed; Low observations remain deferred. No binding finding in PR50/51/52. Owner chaproi reviews deferred Low dispositions during5-7December hardening; no promised fix date. The live locator defect was test-only, corrected without application changes, and is preserved separately.


---

<!-- PDF page 29 /D -->
## D3. Technical debt, separate from defects
| Debt / impact | Priority | Disposition / owner |
|---|---|---|
| Scoped Prisma config deepmerge-ts8 override exceeds upstream pin; future compatibility cost. | Medium | chaproi retains removal criteria; after a compatible upstream fix, repeat audit/API/browser/Docker/populated-upgrade checks. No dependency change here. |
| Category policy appears in server, UI and SQL; a future edit can drift. | Medium | chaproi preserves independent literal pair tests and coordinated migration review. No speculative refactor. |
| No direct SQL or revision-digest read in this session. | Evidence limitation | Disclose the distinction. Use existing authorized read access when available; no invented approval gate. |


## D4. Configuration and concise runbook
Use Node24/npm/PostgreSQL and separate owned development/test databases. Privately configure DATABASE_URL, TEST_DATABASE_URL and matching APP_ORIGIN/PORT. Existing npm ci -> db:migrate -> db:seed is for a new owned local/demo database only.

The strict helper requires a loopback test_lab7_<16hex> database, matching role, public schema and live identity. CI provisions this target. Normal delivery is reviewed release -> main -> reusable CI -> image push -> migration job --wait -> service update -> selected live checks. Never seed/reset a shared database. Rollback over larger saved values requires review; do not clamp/delete data.

## D5. Brief record-based engineering retrospective
1. **What helped?** Versioned pair contracts and literal boundary matrices made29 semantic RED failures distinguishable from fixture errors. Frozen assertions verified the same behavior in GREEN and through exact-main CI.
2. **What hurt?** The old club_ci target did not satisfy the strict guard, requiring a separately reviewed CI adaptation. Direct-cloud access was unavailable; the initial exact Category locator also stopped live checks. Reusing the inherited combobox selector corrected the harness without production changes.
3. **What changes before Final?** Owner chaproi will keep the private handoff locatable and assign deployment-observation/readiness ownership before5-7 December hardening, then carry the remaining direct-observation and deferred-Low limitations into the final review.

These are conclusions grounded in commits/logs, not a quotation of newly confirmed personal experience.


---

<!-- PDF page 30 /D -->
## D6. Contributions and AI use
**นายสิริกร ฝันนิมิตร /67070507215 /TH-038**, solo with instructor permission, directed requirements and implementation, reviewed AI-assisted work and checked recorded results. The earlier student-confirmed factual declaration is retained: AI tools assisted analysis, implementation, tests and report preparation. **ChatGPT and Codex** assisted these tasks. Reviews by thananun-7203 and original Lab6 UAT retain their actual attribution. No new student confirmation or long personal reflection is claimed.

## D7. Limitations and remaining actions

- Direct Cloud Run/SQL reads are unavailable. Log-reported revision/traffic and pushed registry digest are distinct from a directly resolved revision digest.
- The production migration job succeeded. Category migration is identified in exact-main CI and the main-image/source chain, not a direct production migration-row query.
- The populated rehearsal is isolated evidence. Original Lab6 peer acceptance applies to43aa8d7 only; our checks are not external UAT.
- Original RED/setup failures, warnings, source attribution and the completed D2 packet remain preserved. No additional deployment, unrelated feature, Issue closure or LEB2 submission was performed.
- F-06 totals, F-07 and F-08 remain Planned. Technical evidence is separate from the owner's final acceptance/submission decision.

## D8. Source map
Repository: https://github.com/chaproi/club-expense-approval<br>
Issue49 / contractPR50 / implementationPR51 / releasePR52. Full submitted reviews are in review-chain.json; metrics lists in metrics-source.json; main logs and deployment identity in command-excerpts.log, exact-main-results.json and deployment-identity.json. Evidence links: [contract review](https://github.com/chaproi/club-expense-approval/pull/50#pullrequestreview-6084244796), [implementation review](https://github.com/chaproi/club-expense-approval/pull/51#pullrequestreview-6092360927), [release review](https://github.com/chaproi/club-expense-approval/pull/52#pullrequestreview-6096017531), [actual-main run](https://github.com/chaproi/club-expense-approval/actions/runs/46120371207), [pinned GREEN evidence](https://github.com/chaproi/club-expense-approval/blob/48608e2289079a7858f56141fb4e1875f0bc9e9b/docs/labs/lab-07/green-verification-2026-11-27.md). Public/live case files identify role, time, expected/actual, version and cleanup.

Original seven-page course PDF SHA256:
13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb.
The student-supplied announcement supersedes only its instructor/TA approval gate. Weights25/50/15/10 are not awarded marks. Deadline29 November2026,23:59 Thailand is unchanged.
