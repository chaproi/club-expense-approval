# Lab 7 amount-limit contract and STS — proposed v1.0

27 November 2026, Asia/Bangkok. **NOT EFFECTIVE / PENDING INSTRUCTOR–TA APPROVAL AND INDEPENDENT PEER CONTRACT REVIEW.** This is a versioned amendment proposal, not a replacement of the accepted100000 rule. [Change request, identities and impact](proposal.md) / [future evidence plan](evidence-plan.md). Every AC/STS/result here is **PLANNED / UNEXECUTED**. Do not write/run RED or implement before the approval/review handoff.

## 1. OLD assessed excerpts and proposed revisions

Reference requirement IDs remain BR-01, FR-02, FR-05, BR-02–07/09 and NFR-01/02; the AC-L7/STS-L7 identifiers below are new prospective maintenance mappings, not invented historical IDs.

### SRS BR-01 and feature scope

**OLD, accepted Sprint1 baseline§A BR-01 (43aa8d7):**

> รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม 1–100,000 บาท

**PROPOSED NEW BR-01 excerpt, only if approved:**

> รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม 1–150,000 บาท

The accompanying current SRS scope sentence would change its amount range from1–100,000 to1–150,000, leaving all other wording/IDs unchanged. Historical Sprint1 documents remain original, with a separately dated amendment reference rather than rewriting what was accepted. F-02 uses the revised rule on creation; implemented F-05 inherits the same range on authorized RETURNED edits. This proposal does not imply that RETURNED editing was present in Sprint1.

### Feature SDS/API — F-02 create

**OLD:** baseline§E F-02 POST `/api/expense-requests` accepts exactly `{title,category,amountBaht}` for a Requester; `parseExpenseInput` requires a JSON number, integer,1–100000. Current POST invalid-input message includes “a whole amount of 1–100,000 baht.”

**PROPOSED NEW:** the same endpoint/body/authorization accepts a JSON numeric integer1–150000 inclusive, preserves title trim/length/Unicode and category validation, and returns201 with the same authorized detail shape. Invalid input returns400 `INVALID_INPUT` without creating a request/event. The amount-range portion of the existing creation error becomes “a whole amount of 1–150,000 baht.” Assignment remains server-owned; creation atomically saves one SUBMITTED request and one SUBMITTED event, revision0. No client owner/reviewer/status field is accepted.

### Feature SDS/API — F-05 Save and draft recovery

**OLD, F-05 v1.1 API excerpt:** “Validation matches existing BR-01 (trimmed title1–120 UTF-16 code units, existing categories, integer baht1–100000)”. PATCH accepts exactly `{title,category,amountBaht,expectedRevision}`; Resubmit accepts only `{expectedRevision}`.

**PROPOSED NEW:** replace only `integer baht1–100000` with `integer baht1–150000`. Owning Requester and current RETURNED/revision predicates remain mandatory; Save returns200, keeps RETURNED, increments revision once and appends exactly one EDITED event in the same transaction. Same ID, requester/assignment, createdAt and old events remain. Resubmit stays an explicit revision-only operation, adds one RESUBMITTED event and never implicitly changes amount. SUBMITTED and terminal requests remain read-only.

Draft capture/base snapshot/changed-field Restore, latest saved values, same-field conflicts, Discard, GET-only retry, manual Save, BF-01 clean-draft behavior, per-account/request tab memory and all lifecycle clearing rules remain unchanged. No automatic mutation is introduced. Returned Save's existing generic validation/error message is still truthful; preserve action-specific Save/Resubmit feedback.

### UI and System SDS/data

**OLD:** creation `Amount (baht)` and RETURNED `Corrected amount (baht)` number inputs have `min=1,max=100000,step=1`; System SDS§architecture/data uses integer amount and the database constraint from the original migration:

```sql
CHECK ("amountBaht" BETWEEN 1 AND 100000)
```

**PROPOSED NEW:** both controls retain accessible names, type/min/step/required/pending behavior and use `max=150000`. No new financial feature or business calculation. Existing numeric display/DTO types remain unchanged. A new additive migration replaces only that named range CHECK with:

```sql
CHECK ("amountBaht" BETWEEN 1 AND 150000)
```

These SQL blocks are assessed OLD/PROPOSED excerpts, **not an executable migration committed in this stage**. Prisma Int and PostgreSQL INTEGER need no type change. Apply/validate the wider constraint before new application writes; preserve all existing rows/events without a backfill. See the proposal's populated-target and rollback design.

## 2. Proposed acceptance criteria

All rows: PLANNED / UNEXECUTED; approval/review not recorded.

| AC | Required observable outcome | Planned STS |
|---|---|---|
| AC-L7-01 | Otherwise valid creation and owning Requester RETURNED Save accept whole-baht1,100000,100001,150000; exact amount persists and is read back. | STS-L7-01/03/04 |
| AC-L7-02 |150001,0,negative,fractional and non-number amounts are rejected with400 INVALID_INPUT for real authorized requests, with exact unchanged domain state; non-finite unit inputs also invalid. Title/category/body-shape rules unchanged. | STS-L7-01/02 |
| AC-L7-03 | Both UI controls expose max150000/min1/step1, can submit valid new-range values, and block out-of-range native submission; backend independently enforces range when UI is bypassed. Existing names/roles/loading/error/pending behavior preserved. | STS-L7-03/04/05 |
| AC-L7-04 | Save/Resubmit retain ID/assignment/createdAt/old events, exact expectedRevision, one increment/event per successful operation; stale/concurrent writes and frozen states never append duplicate events. Draft recovery including BF-01 remains intact for larger valid values. | STS-L7-04/06/07 |
| AC-L7-05 | Anonymous/revoked sessions, wrong role, foreign owner, unassigned/self reviewer and wrong Origin cannot gain access through new-range values. SUBMITTED/APPROVED/REJECTED edits remain denied; safe envelopes/projections unchanged. | STS-L7-05/06/09 |
| AC-L7-06 | Fresh and populated migration paths enforce1–150000 in PostgreSQL, preserving exact pre-existing rows/events/IDs/timestamps/revisions immediately after migration. Authorized readback survives app/client restart. | STS-L7-08/09 |
| AC-L7-07 | Original Sprint1 submit→approve/reject→owner history, assigned counts and current Return/Edit/Resubmit work without permission/state/history changes. Larger amounts do not change counts or add totals features. | STS-L7-04/07/09 |
| AC-L7-08 | Reviewed release uses the existing CI/migration-before-deploy pipeline, records exact source/main/revision identity, and changed plus preserved synthetic live checks pass with actual outcomes; no claim before execution. | STS-L7-10 |

## 3. Planned Software Test Specification

All fixtures use unique synthetic actors/requests, real authenticated HTTP/PostgreSQL for domain cases and real Chromium for browser cases. Before any future write, inspect the effective dedicated test URL privately and perform a live database/schema identity probe. Current suite setup's “TEST_DATABASE_URL present” check alone is not proof of target isolation. Never run migrations/seed against operational/shared data. Track owned IDs, snapshot domain data without credential fields, clean only owned rows in FK-safe order, close listeners/contexts and disconnect clients in `finally`. Legitimate login/session bookkeeping is separated from domain-preservation comparisons.

| STS | Preconditions / inputs / level | Independently expected outcome and evidence |
|---|---|---|
| STS-L7-01 | Unit parser and returned-parser inputs:1,100000,100001,150000;150001,0,-1,1.5,`"100001"`,null,boolean,object,array; NaN/Infinity at unit boundary only | First four valid numbers return the normalized exact amount; invalids return null. Do not encode NaN/Infinity as JSON “numbers”. Preserve all unrelated title/category/unknown-field assertions. Expected meaningful pre-change RED is100001/150000 rejection, not setup/type errors. |
| STS-L7-02 | Separate valid owner POST and PATCH RETURNED fixtures, correct Origin/current revision; invalid amounts above; include missing amount/extra assignment/status |400 INVALID_INPUT; compare complete request/event snapshots and counts before/after. No row/event, timestamp or revision change. Use fresh valid controls so validation failure is attributable to the intended field. |
| STS-L7-03 | Real F-02 browser + HTTP creation with fresh configured Reviewer; exercise four valid boundaries and native150001 case | max/min/step verified; valid201, revision0, exact amount and server assignment, exactly one SUBMITTED event; owner and assigned reviewer read exact values, foreign owner cannot. Native-invalid click sends no POST; direct API invalid sends400. On old code, assert real HTTP201 for100001/150000 before UI-dependent deeper checks; report deeper assertions unreached if it returns400. |
| STS-L7-04 | API-created owned request→real Reviewer Return; browser Save at100001/150000 then manual Resubmit; amount draft from a genuine two-session stale Save | Save200 keeps same RETURNED record and amount, revision r+1/one EDITED; Resubmit200 uses current revision, same amount, r+2/one RESUBMITTED. Assert previous event IDs/order and createdAt/assignment preserved via private DB snapshot. Restore stages only changed fields and sends no write until explicit Save; no clean phantom draft. |
| STS-L7-05 | Valid150000 body with anonymous/revoked session, Reviewer creating, foreign owner PATCH, Reviewer PATCH and bad Origin; valid ordinary-range controls for exact inherited guard precedence | Preserve401 UNAUTHENTICATED; Reviewer role403 FORBIDDEN; foreign owner404 NOT_FOUND; Origin403 FORBIDDEN_ORIGIN; no domain mutation or private response fields. Missing assignment remains503 REVIEWER_UNAVAILABLE with no create. Keep exact existing endpoint ordering; do not let invalid new-range bodies obscure a state/security assertion in the pre-change control. |
| STS-L7-06 | Fully valid PATCH on SUBMITTED/APPROVED/REJECTED, stale RETURNED revision, revision overflow, same-revision concurrent edits/resubmits | State/stale409 INVALID_STATE; unchanged snapshots for rejected writes. Concurrent inherited tests retain one200/one409 and one event. New-range and ordinary controls both required after GREEN. No timeout/retry/assertion relaxation. |
| STS-L7-07 | Existing API races, revision/old-round tests, draft-recovery/BF-01 suite and original approval/rejection browser journey | Preserve original substantive assertions, exact event sequences and no-write recovery controls. Record current run/file/case/pass/fail/skip, not an assumed47/19 total. New150000 approved/rejected fixtures preserve amount/history; no two-stage feature is implied. |
| STS-L7-08 | Owned new DB and separate owned populatedcc6b04c DB with authenticated-created SUBMITTED/APPROVED/REJECTED/RETURNED records; new migration only | Immediate exact pre/post domain checksum equality; original migration checksums unchanged; PostgreSQL constraint expression widened. On isolated inserts/updates150000 permitted,150001/0/-1 violate CHECK; use real fixture foreign keys and rollback negative probes. Fresh ORM/API success must not substitute for DB constraint proof. A new proposed `server/test/amount-limit-migration.test.ts` may own these tests after approval. |
| STS-L7-09 | Snapshot old records before intentional new workflow writes; restart only the owned app/Prisma client; run unchanged auth, decision, return/resubmit/summary cases | Exact old ID/assignment/fields/timestamps/history readback after migration/restart; separate expected intentional events from preservation snapshot. Status counts follow current records, not amount; unchanged owner/reviewer visibility and Sprint1 approve/reject paths. |
| STS-L7-10 | Future reviewed main/image and successful migration job; private authorized synthetic live actors | Record actual main/run/image/revision and approved change; create100001/150000, reject150001, exercise owning RETURNED Save and one preserved Sprint1 decision/access path. No shared reset/seed or secret publication. Record failure/not-run honestly; live execution and final readiness remain UNEXECUTED now. |

## 4. Legitimately revised expectations versus preserved regressions

1. `server/test/expense-input.test.ts`, T-05: move100001 out of invalid amounts and add100001/150000 valid; add150001 invalid. Keep0/fraction/string/title/category/extra-field checks. Add missing negative/non-finite coverage without changing their business meaning.
2. `server/test/return-resubmit-summary.test.ts`, T-F05-02: the100001→400 expectation is intentionally superseded only after approval; replace its upper invalid boundary with150001 and add positive100001/150000 cases. Keep every forged field, Unicode, revision, denial, race, snapshot and history assertion.
3. `server/test/expense-requests.test.ts`, T-05, currently checks0 and client assignment; it does **not** already prove the entire range or direct database CHECK. Extend meaningful positive/negative coverage; do not claim filename coverage.
4. `client/test/expense-decisions.spec.ts` and `client/test/f05-draft-recovery.spec.ts` remain regression evidence; existing examples use small amounts. Add new-range browser cases only where necessary. No snapshot rewrite, skip, reduced concurrency, altered timeout, dependency change or weakening of inherited outcomes.
5. Existing baseline AC-04/05 and F-05 AC-F05-02 keep IDs. Their prospective range/test revision is explicitly recorded here; historical100001 failure expectations/runs remain unchanged in Git and the D2 packet.

## 5. Future execution sequence — commands not run in this stage

After real instructor/TA approval **and** peer contract review, confirm and integrate the approved current source through the normal project workflow; record any new pre-change SHA and content drift before committing tests. Commit tests first. The future focused RED invocation from repository root is:

```powershell
node --env-file-if-exists=.env --import tsx --test server/test/expense-input.test.ts server/test/expense-requests.test.ts server/test/return-resubmit-summary.test.ts
```

Execute against actual old production and its original migrated isolated DB, retaining each semantic failure/status/assertion and reached/unreached distinction. Native client constraints and the database CHECK are independent reasons a ceiling-only patch is incomplete. Commit the RED record before any source/migration correction. The planned migration test filename above does not exist yet and is not included in this command.

After the approved bounded source/UI/additive-migration correction, execute the same focused tests plus the separately added migration case on correctly upgraded owned targets. Then sequentially, from root:

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd exec -- tsc --noEmit
npm.cmd run build
docker build -t club-expense-approval:lab7-candidate .
```

Use existing lockfiles/runtime/CI; no predetermined counts or passes. Reuse existing migration/image/populated-upgrade patterns but parameterize and verify the **new actual candidate SHA**, not pinned historical7ab4168/a6c93ab. Test native image migration and app smoke against only an owned target before a reviewed release. Record every failure and correction; do not turn infrastructure/collection errors into RED. Publication of this plan triggers none of these commands.
