# Lab 7 category-dependent amount contract and STS — proposed v1.1

**Post-release evidence checkpoint, 28 November 2026:** contract PR #50, implementation PR #51 and release PR #52 were independently reviewed and merged. Released main is `c259afe45eb49311c1f7bb9e166c4443041b9b82`; existing deployment run46120371207 succeeded. Exact-main CI184/184 unit/API and23/23 browser passed. Three public cases and all eight selected authenticated live case requirements have passing owner-directed evidence; the first locator-failure attempt is retained. See [post-deployment record](postdeploy-2026-11-28/README.md) and [self-contained Lab7 report](../../reports/lab-07/report.md). These are our automated checks, not new external peer UAT or final owner/submission acceptance. Direct-cloud/SQL and pre-deployment preservation limitations remain. The dated planning/RED/GREEN statements and checkbox states below are historical checkpoints; instructor/TA approval remains Not required under the recorded announcement. F-06 totals/F-07/F-08 remain Planned.

**Current local GREEN checkpoint,27 November 2026:** [executed candidate results and AC/STS scope](green-verification-2026-11-27.md). Implementation/migration ec10dd4; supplementary checks a0d1e9d;184/184 unit/API and23/23 browser plus fresh/populated/image verification pass. Prior Proposed/Planned/Unexecuted and RED wording below is historical, preserving its actual checkpoint. Contract acceptance is verified; independent implementation review, integration, new-policy release/deployment and STS-L7-10 remain Pending. Instructor/TA approval remains **Not required under updated instructor announcement**.

**Current checkpoint,27November2026:** this exact v1.1 contract is accepted for tests-first implementation by the [verified independent review and staging merge](contract-acceptance-2026-11-27.md). Old Pending/status text below preserves the pre-review checkpoint; the AC/STS policy remains unchanged. No implementation/operational acceptance follows from that review. Instructor/TA approval remains Not required under updated instructor announcement.

27 November 2026 (Asia/Bangkok). **PROPOSED / NOT EFFECTIVE. Independent peer contract review PENDING before implementation.** Instructor/TA approval: **Not required under updated instructor announcement** ([student-supplied evidence](instructor-announcement-2026-11-27.md)). No personal Approved status. Implementation and all RED/GREEN remain **UNEXECUTED**.

[Current proposal/impact](proposal.md) / [evidence plan](evidence-plan.md). This same file path now carries v1.1; [v1.0 at12d40ec](https://github.com/chaproi/club-expense-approval/blob/12d40ecf571d50a012045b324d48ae50459c21eb/docs/labs/lab-07/contract-proposed-v1.md) preserves the original uniform150000 proposal and earlier pending gate. No AC IDs are retired; AC-L7-01–08 and STS-L7-01–10 are prospectively revised below, not historical executions.

## 1. OLD assessed excerpts and PROPOSED NEW policy

### SRS BR-01

**OLD, accepted43aa8d7 baseline§A BR-01:**

> รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม 1–100,000 บาท

**PROPOSED NEW, student-selected policy pending peer review:**

> รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็มตั้งแต่ 1 บาท โดย ACTIVITY ไม่เกิน 150,000 บาท, EQUIPMENT ไม่เกิน 120,000 บาท และ TRAVEL ไม่เกิน 100,000 บาท ต้องตรวจหมวดและยอดร่วมกัน

Current SRS scope and BR-01 would adopt the pair-dependent rule after substantive review. FR-02/F-05 inherit it; original requirement IDs and historical Sprint1 baseline remain intact. This is an intentional change to previously correct behavior, not a correction of the accepted100000 rule. The instructor announcement does not select or approve these amounts. It removes only the prior instructor/TA approval prerequisite.

| Selected category | Valid whole-baht range, inclusive | Maximum+1 invalid |
|---|---|---|
| ACTIVITY |1–150000 |150001 |
| EQUIPMENT |1–120000 |120001 |
| TRAVEL |1–100000 |100001 |

Validate category and amount as one pair, with no fallback maximum for unknown/empty category. For example125000 succeeds only with ACTIVITY;110000 succeeds with ACTIVITY/EQUIPMENT but fails with TRAVEL. Numeric JSON integer only: no string coercion at API boundary, fractional baht or non-finite values. Lower bound remains1. Category enum, trimmed title1–120 UTF-16 units and invalid-text rules remain unchanged.

### Feature SDS/API — F-02 creation

**OLD:** POST `/api/expense-requests` takes exactly `{title,category,amountBaht}` for an authenticated Requester. Shared validator accepts integer1–100000 independently of category. The current creation validation message includes “a whole amount of 1–100,000 baht.”

**PROPOSED NEW:** same body/response shape and guards, but validate the known category and its whole-baht range together. Valid pair→201, revision0, exact category/amount persisted, server-derived owner/reviewer and exactly one atomic SUBMITTED event. Invalid pair→400 `INVALID_INPUT` without creating a request/event. Use truthful category-specific limit feedback; the existing uniform100000 wording must be updated. For a known category, explain its maximum and whole-baht lower bound; for unknown/missing category request a supported category, never claim an invented default limit. Preserve safe envelope and no private field leakage.

### Feature SDS/API — F-05 Save/Resubmit and recovery

**OLD F-05 v1.1 API excerpt:** “Validation matches existing BR-01 (trimmed title1–120 UTF-16 code units, existing categories, integer baht1–100000)”. PATCH accepts exactly `{title,category,amountBaht,expectedRevision}`; Resubmit accepts exactly `{expectedRevision}`.

**PROPOSED NEW:** amount must be an integer from1 through the submitted category's maximum (ACTIVITY150000/EQUIPMENT120000/TRAVEL100000). Evaluate the pair even when only category changed. Same owning Requester/current RETURNED/current revision predicates;200 Save keeps RETURNED, increments once, adds exactly one EDITED event atomically. Same ID, owner/assignment, createdAt and prior events remain. Invalid pair→400 `INVALID_INPUT` with no change to fields, updatedAt, revision or history. Current Save generic validation message can remain if truthful; UI must also explain the category-specific violation. Do not impose one exact implementation message beyond the preserved envelope/action and accurate limit requirement.

Resubmit remains manual and revision-only, cannot silently save form values, increments once and adds one RESUBMITTED. SUBMITTED/APPROVED/REJECTED edits remain denied. Existing guard order/denial semantics and stale conflict recovery remain; a valid pair must be used to isolate state/authorization tests.

Draft/base/changed-field capture, latest saved values, same-field markers, changed-fields-only Restore, Discard, GET-only retry, account/request tab-memory clearing, BF-01 clean-draft and explicit manual Save remain unchanged. Restoring an amount over a newer untouched category can produce an invalid pair: retain both visible values without clamping; show the current category limit and prevent invalid Save/Resubmit. The user chooses valid correction/category before manual Save. A Restore that already equals latest still clears its phantom draft under BF-01. No auto-write or extra EDITED event arises from selection/Restore/validation.

### UI in both creation and RETURNED edit forms

**OLD:** `Amount (baht)` and `Corrected amount (baht)` use number/min1/max100000/step1.

**PROPOSED NEW:** retain accessible names/roles, number/min1/step1/required and existing pending/focus behavior. Derive max from the current category; expose readable category-limit feedback linked to the invalid controls. Without a valid selected category the form cannot submit and no permissive default is implied. Category change updates the applicable limit immediately, **retains the amount unchanged**, and shows an error if the pair is invalid. Do not change/clamp/clear amount, reset selected category, mutate/retry/Save/Resubmit or write browser/server storage automatically. Switching back or explicitly correcting the amount clears that category-limit error once valid. Ordinary dirty/pending/explicit-Resubmit rules still apply.

### System SDS / PostgreSQL invariant

**OLD applied migration constraint:**

```sql
CHECK ("amountBaht" BETWEEN 1 AND 100000)
```

**PROPOSED NEW assessed CHECK expression:**

```sql
CHECK (
  ("category" = 'ACTIVITY' AND "amountBaht" BETWEEN 1 AND 150000)
  OR ("category" = 'EQUIPMENT' AND "amountBaht" BETWEEN 1 AND 120000)
  OR ("category" = 'TRAVEL' AND "amountBaht" BETWEEN 1 AND 100000)
)
```

This is a proposal excerpt, not an executable migration added now. Existing category enum and amount INTEGER columns are NOT NULL; unsupported categories remain rejected by enum/API, and no CHECK branch grants them a maximum. No type/precision/schema-model/enum/index change required. A **new additive migration** replaces only `ExpenseRequest_amountBaht_check` transactionally; never edit the applied original migration. Verify the actual old definition, validate the new constraint and preserve all old rows/events/timestamps/revisions. Every new maximum is at least the old100000, so valid existing rows in all categories remain valid unchanged. No backfill or amount normalization.

[Rollout/rollback design](proposal.md): migrate before app update, verify serving revision, preserve larger saved pairs on any rollback. Restoring an old/narrower constraint is unsafe while conflicting rows exist. No clamp/delete/reset to make rollback pass; reviewed forward correction or separately reviewed narrowing/data policy only.

## 2. Proposed AC — all PLANNED / UNEXECUTED

| AC | Required observable outcome | Planned STS |
|---|---|---|
| AC-L7-01 | Both operations validate the pair:1,100000 and each category maximum accepted; maximum+1 rejected.110000/125000 produce category-dependent outcomes, not one uniform cap. Exact saved pair read back. | STS-L7-01/02/03/04 |
| AC-L7-02 | Invalid pair,0,negative,fractional,missing/non-number amount or unsupported category returns400 INVALID_INPUT with exact unchanged fields/timestamps/revision/history and no new rows/events. Existing title/body validation remains. | STS-L7-01/02 |
| AC-L7-03 | Both UI forms update max/feedback with category; lower-cap switch retains amount, exposes accessible error and sends no mutation; correction/switch-back restores validity. Native controls and backend independently enforce pair. | STS-L7-03/04 |
| AC-L7-04 | Explicit valid Save/Resubmit retain ID/assignment/old history, exact revision increments/atomic events. Invalid category switches/restored pairs never save automatically; conflict/recovery/BF-01 and stale/concurrent guards remain. | STS-L7-04/06/07 |
| AC-L7-05 | Session/role/ownership/Origin/status/revision restrictions and safe projections stay intact for valid proposed pairs; submitted/terminal requests remain read-only. | STS-L7-05/06/09 |
| AC-L7-06 | New CHECK validates pair on insert and amount-only/category-only update; fresh/populated migration preserves all old valid categories/rows/events, old migration checksums and restart readback. Rollback never rewrites larger values. | STS-L7-08/09 |
| AC-L7-07 | Original submit→approve/reject→owner history and current Return/Edit/Resubmit/draft/assigned-count paths remain; amount policy adds no totals/two-stage/filter behavior. | STS-L7-04/07/09 |
| AC-L7-08 | Revised contract peer-reviewed before implementation; later reviewed code/CI/staging/main/migration/deployment and changed/preserved synthetic checks record actual identities/results. Instructor/TA approval is Not required under updated instructor announcement. | STS-L7-10 |

## 3. Planned STS

Every result below is UNEXECUTED. Reuse existing unique actor/request fixtures, real authenticated HTTP/PostgreSQL and Chromium. Privately verify the effective dedicated test target and live DB/schema before future writes; TEST_DATABASE_URL presence alone is not isolation proof. Track owned IDs immediately, snapshot domain state without secrets, distinguish legitimate authentication bookkeeping, clean owned rows in FK order and close/disconnect in finally. No operational/shared migration/seed/reset.

| STS | Preconditions / input / level | Independent expected result / evidence |
|---|---|---|
| STS-L7-01 | Unit parseExpenseInput/parseReturnedInput for each category:1,100000,max,max+1; cross-pair110000 and125000; invalid0,-1,1.5,string,null,boolean,object,array,missing amount/category,unknown category; NaN/Infinity unit only | Independently literal ACTIVITY150000/EQUIPMENT120000/TRAVEL100000 expectations, not deriving expected values from production map. Per-category max accepted;max+1 rejected; cross-pair matrix below. Preserve all title/category/body checks. New valid ACTIVITY/EQUIPMENT upper values fail on old production, while TRAVEL controls may already pass; report honestly. |
| STS-L7-02 | Authorized POST and current-revision PATCH RETURNED per-category max+1 and cross-pair invalid values; separate fresh fixtures and complete snapshots |400 INVALID_INPUT, safe truthful feedback and exact unchanged fields/updatedAt/revision/history; no new request/event. Numeric-only validation independent of browser. No expected state/auth denial inferred from an invalid pair. |
| STS-L7-03 | Real create form and real HTTP for all category boundaries. Start ACTIVITY125000→EQUIPMENT→TRAVEL→ACTIVITY; EQUIPMENT110000→TRAVEL→correct100000 | Max follows category; invalid pair retains amount/selected category, linked feedback, no POST on switch/invalid submission. Switching back/correcting restores valid form. Explicit create returns201 exact pair/revision0/one SUBMITTED; owner/assigned reads exact. Isolate HTTP positive assertions from deeper UI assertions on old code; no fabricated success. |
| STS-L7-04 | Owned real returned records: apply same category-switch sequences in edit form; explicit Save/Resubmit. Two real sessions: draft changes amount to125000 while newer saved category becomesTRAVEL with valid old amount | Category-only invalid Save sends no browser PATCH; direct PATCH invalid→400/no state change. Stale valid draft PATCH→real409; latest/draft separate; Restore keeps latest untouchedTRAVEL and draft125000 visibly invalid, no write/clamp, Save blocked until user selects valid pair. Manual Save uses latest revision; one EDITED, then one RESUBMITTED. Keep BF-01 clean/no-difference behavior. |
| STS-L7-05 | Valid ACTIVITY150000/EQUIPMENT120000/TRAVEL100000 pairs with anonymous/revoked/wrong-role/foreign-owner/invalid-Origin actors; valid old-range controls | Inherited401 UNAUTHENTICATED,403 FORBIDDEN/FORBIDDEN_ORIGIN,404 hidden owner; no domain mutation/private response. Missing valid Reviewer assignment remains503/no insert. Preserve actual guard precedence; category policy must not obscure access checks. |
| STS-L7-06 | Valid pairs on SUBMITTED/APPROVED/REJECTED PATCH, stale RETURNED revision, overflow and same-revision concurrent edit/resubmit | State/stale409; exact unchanged rejected snapshots. Existing races retain exactly one200/one409 and one event. No timing/retry/concurrency/assertion relaxation; fresh and larger-value controls after GREEN. |
| STS-L7-07 | Existing decision/old-round/revision/race, draft-recovery/BF-01 and browser journeys; high valid ACTIVITY/EQUIPMENT records plus unchangedTRAVEL | Original assertions/events retained; explicit decisions preserve exact category/amount; no Restore/category-selection write, no duplicate history. Report actual counts/failed/skipped at exact SHA, never assume old47/19. |
| STS-L7-08 | Fresh owned target plus separate populatedcc6b04c target containing all categories and old1/100000 boundaries across valid statuses/events; new migration only | Immediate pre/post domain snapshots exact; old migrations unchanged; actual CHECK validated. Direct insert and amount-only/category-only updates at per-category max/max+1 and cross-pair125000/110000 enforce same matrix; rollback invalid probes, preserve source snapshots. No API-only substitute. Inspect rollback incompatibility on owned data, never destructive narrowing. |
| STS-L7-09 | Before intentional writes, save old row/event snapshot; restart owned app/client after migration; unchanged auth/workflow/summary suites | Exact IDs/assignment/fields/timestamps/revisions/old events survive migration/restart. Separate intentional later workflow deltas. Scoped status counts unaffected by amount policy; original approve/reject and owner restrictions preserved. |
| STS-L7-10 | Future peer-reviewed revision/code/main/image, successful migration job, authorized synthetic live actors | Trace actual reviewed SHA/run/image/revision; selected category max/max+1/cross-pair/category-switch, returned Save and preserved decision/access checks. No shared reset/seed, no old CI relabelled, no instructor gate reintroduced. Current stage UNEXECUTED. |

### Literal boundary and cross-category expectations (both POST and RETURNED PATCH)

| Amount | ACTIVITY | EQUIPMENT | TRAVEL |
|---|---|---|---|
|1 | Accept | Accept | Accept |
|100000 | Accept | Accept | Accept |
|100001 | Accept | Accept | Reject |
|110000 | Accept | Accept | Reject |
|120000 | Accept | Accept | Reject |
|120001 | Accept | Reject | Reject |
|125000 | Accept | Reject | Reject |
|150000 | Accept | Reject | Reject |
|150001 | Reject | Reject | Reject |

Accept means201 create or200 authorized current RETURNED Save, with exact persisted pair; Reject means400 INVALID_INPUT/no domain change, assuming all other guards/input are valid. TRAVEL100001 is the required maximum+1 case. No observation has been executed by publishing this table.

## 4. Legitimate future expectation revisions

- Existing `server/test/expense-input.test.ts` T-05 uses EQUIPMENT: its100001-invalid expectation would legitimately become valid only for that category, with120001 invalid instead. Keep TRAVEL100001 invalid. Add ACTIVITY150000/150001, equipment120000/120001, all cross-pair and invalid type/title/category/body checks.
- `server/test/return-resubmit-summary.test.ts` T-F05-02 uses ACTIVITY: its100001-invalid expectation changes to valid;150001 is its upper invalid boundary. Add equipment/travel pairs and category-only invalid writes without dropping exact unchanged-state assertions.
- `server/test/expense-requests.test.ts` currently checks0/client assignment; extend actual boundaries instead of claiming existing full-range/direct-CHECK coverage. New proposed migration and browser case files can be added after substantive peer review; none is added now.
- Preserve existing auth, access, Origin, state, old-round, concurrent revision, draft lifecycle/BF-01 and browser assertions. No skips/threshold/timeout/retry/concurrency or snapshot changes to hide regressions. Historical expectations/runs at12d40ec and earlier remain unchanged in Git.

## 5. Future execution — not run now

After substantive independent peer review of this revised contract, integrate approved current source through normal workflow, record actual pre-change SHA/drift, commit tests first and run focused semantic RED on unchanged production/original migrated isolated DB:

```powershell
node --env-file-if-exists=.env --import tsx --test server/test/expense-input.test.ts server/test/expense-requests.test.ts server/test/return-resubmit-summary.test.ts
```

Expect ACTIVITY/EQUIPMENT new valid pair assertions to fail under old100000 rule; already-correct TRAVEL/invalid/security controls may pass. Collection/setup errors are not semantic RED. Commit actual RED evidence before source/UI/new additive migration. Deeper assertions may be unreached; record that explicitly. No instructor/TA approval prerequisite remains.

After bounded GREEN and the new migration, repeat same changed-behavior checks plus the planned direct constraint/populated cases and category-switch browser coverage. Then sequentially use existing project commands:

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd exec -- tsc --noEmit
npm.cmd run build
docker build -t club-expense-approval:lab7-candidate .
```

All are future commands, not executed here. Keep lockfiles/settings, exact candidate provenance and honest every-attempt results. Verify fresh/populated image migration/smoke on owned targets using the actual candidate SHA, not historical pinned D2 candidates. Review, CI, staging, reviewed main, deploy and selected changed/preserved live checks precede acceptance; historical47/19 and proposal CI do not prove this unimplemented policy.
