# Lab 7 proposal: increase the whole-baht request limit

Version 0.1, 27 November 2026 (Asia/Bangkok). **PROPOSED / NOT EFFECTIVE.** Instructor/TA approval and independent peer contract review are **PENDING**. The accepted rule remains1–100,000baht. No implementation or RED execution is authorized by this document.

Proposal Issue: [#49](https://github.com/chaproi/club-expense-approval/issues/49), created by chaproi on27November2026,01:02:58Bangkok (26November18:02:58Z). Author/owner: chaproi (นายสิริกร ฝันนิมิตร,67070507215,TH-038, Solo with previously documented instructor permission). An external peer must review the proposed contract; AI assistance is not that review. Existing solo permission does not constitute approval of this maintenance change.

## 1. Change request and reference identities

| Item | Verified reference / status |
|---|---|
| Original requirement | BR-01: integer whole-baht amount1–100,000; F-02 creation, with inherited F-01/F-03 security/workflow. Current F-05 RETURNED editing reuses the rule. |
| Accepted Sprint1 reference | [43aa8d7472aa8852654d0d634d7239c3765c5869](https://github.com/chaproi/club-expense-approval/commit/43aa8d7472aa8852654d0d634d7239c3765c5869), original Lab6 acceptance/retest only at that version. |
| Actual current pre-change source / last verified deployed main | [cc6b04c8e98191be591a3b755d25988148523909](https://github.com/chaproi/club-expense-approval/commit/cc6b04c8e98191be591a3b755d25988148523909). Fresh origin fetch on27November found main unchanged. No new live/cloud read was performed. |
| Proposal branch and actual base | `docs/lab7-amount-limit-proposal`, separate worktree from fetched `origin/main` atcc6b04c. `origin/staging/sprint-2` isecab746d02b33a140775f53a5079bb7f57f5cd42 with the same tree `d6598a339d79b8bf351025a1ad6c1060105e62a1`. Existing `origin/staging/sprint-3` remains older48d10cf; it was not used as a current implementation baseline. |
| Intervening development | Reviewed Sprint2 Return/Edit/Resubmit, revision handling and draft recovery/BF-01; scoped config dependency overrides; campus UI; count-only F-06. They coexist with the original amount rule and must remain intact. F-06 totals/F-07/F-08 remain Planned. |
| Completed D2 documentation | [427d7c01ea9a62a5172a9a85ce4c6a9d48326e23](https://github.com/chaproi/club-expense-approval/commit/427d7c01ea9a62a5172a9a85ce4c6a9d48326e23). Its worktree and pending PDF filename change were preserved, not carried into this proposal. |
| Lab7 source | Supplied Lab7 maintenance specification,7pages, SHA-256 `13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb`; §§2/3.1–3.4/4. Due29November2026,23:59Thailand. No extension claimed. |

**Old behavior:** otherwise valid creation and owner-authorized RETURNED Save accept integer1–100,000 inclusive;100,001 is rejected. **Proposed new behavior:** those same operations accept integer1–150,000 inclusive, including100,001 and150,000;150,001 remains invalid. This is an intentional change to a previously correct Sprint1 business rule, not a bug fix or completion of unchanged later-sprint backlog.

**Student-proposed rationale:** permit a larger single request for a club activity/equipment plan while retaining whole-baht arithmetic and the existing single-request approval process. No real stakeholder request, budget authority or financial-policy approval is asserted. The instructor/TA may reject or narrow this rationale/scope.

Only the amount ceiling and corresponding validation/constraint documentation change. Title trim/Unicode/length, fixed categories, lower bound, number type, body shape, server-derived assignment, authorization, exact Origin, RETURNED-only editing, revision checks, atomic events and draft lifecycle remain unchanged. SUBMITTED/APPROVED/REJECTED do not become editable. Existing saved records/history are not rewritten. There is no new currency, decimal handling, transfer, budget, financial total, two-stage approval or filter feature.

## 2. Approval and review record

| Gate | Decision | Person | Date/time | Evidence / reviewed revision |
|---|---|---|---|---|
| Instructor/TA change approval | PENDING; no approval requested automatically | Not recorded | Not recorded | Not recorded; explicitly approve both F-02 and inherited F-05 scope, plus required range-constraint migration |
| External peer revised-contract review | PENDING | Not recorded | Not recorded | Not recorded; review this proposal and [proposed contract/STS](contract-proposed-v1.md) at an exact published SHA before implementation |
| Student acceptance of final contract/release | PENDING | chaproi | Not recorded | Not inferred from publication or AI-assisted preparation |

Record the actual approver, decision, timestamp and message/link after it exists. If approval changes the proposal, version the contract and obtain review of the actual revised text. Do not backdate approval, RED or peer review.

## 3. Evidence that the old rule already existed

Read-only inspection of accepted43aa8d7 confirms:

- [Original SRS BR-01 and F-02 AC-04/05/T-05](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/docs/sprint-1-baseline.md):1–100,000 whole baht, with1/100000 valid and100001 invalid.
- [Server validator](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/server/src/expense-input.ts) rejects `amountBaht > 100_000`.
- [Original expense migration](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/prisma/migrations/20261107000000_expense_requests/migration.sql) creates `ExpenseRequest_amountBaht_check` with `BETWEEN 1 AND 100000`.

At pre-changecc6b04c, `parseExpenseInput` is called directly by POST creation and by `parseReturnedInput(fields)` for PATCH Save. `parseReturnedInput(..., false)` handles revision-only Resubmit without revalidating an amount. The two client number inputs have `min=1`, `max=100000`, `step=1`; UI converts amount strings with `Number` before sending. Native input constraints complement, not replace, backend validation. These are source-inspection facts, not new executed behavior results.

## 4. Impact and traceability

All AC/STS below are proposed and **UNEXECUTED**. Exact normative excerpts and cases are in [contract-proposed-v1.md](contract-proposed-v1.md).

| Requirement → feature | SRS / Feature SDS / System SDS section | Proposed AC → planned STS | Actual modules / impact or no-change reason |
|---|---|---|---|
| BR-01 / FR-02 → F-02 | [SRS](../../srs.md) scope + BR-01; [baseline](../../sprint-1-baseline.md)§E F-02/AC-04–05; [System SDS](../../system-sds.md) architecture/data and screens | AC-L7-01/02/03 → STS-L7-01/02/03/05 | `server/src/expense-input.ts`, `server/src/expense-requests.ts` POST and its current1–100,000 error text; `client/src/expense-requests.tsx` creation max; `server/test/expense-input.test.ts`, `server/test/expense-requests.test.ts`. Revise ceiling/messages and explicitly justified100001 expectations only after approval. |
| BR-01 / FR-05 / BR-05/06/09 → F-05 | [F-05 v1.1](../../contracts/f-05-edit-resubmit.md) API/validation, AC-F05-01/02 and recovery§1–7; System SDS current additions | AC-L7-01/02/04/05 → STS-L7-01/04/05/06/07 | `parseReturnedInput` and `changeReturned` share input parser; same client file's corrected amount max. `server/test/return-resubmit-summary.test.ts`, `client/test/f05-draft-recovery.spec.ts`. Preserve current revision/event and recovery code; existing generic Save feedback remains accurate and needs no invented range message. |
| NFR-01 / FR-01 / BR-02/03 → F-01/F-02/F-03/F-05 | SRS security/assignment; baseline§C/§E; F-05 common safety rules | AC-L7-03/05 → STS-L7-05/06/07 | `server/src/auth.ts`, `server/src/expense-requests.ts`, `server/src/app.ts`, `client/src/App.tsx`; existing auth/access/Origin tests. No auth/session/guard-order/body/DTO change required by a numeric ceiling. Use valid proposed-range bodies when testing preserved denials. |
| BR-04/05/06 / NFR-02 → F-03/F-04/F-05 | System SDS conditional status/revision transaction and history; F-04/F-05 AC/STS | AC-L7-04/05/07 → STS-L7-06/07/09 | `server/src/expense-requests.ts` transactional create/save/decision; existing decision, race, restart and browser journeys. Preserve atomic SUBMITTED/EDITED/RESUBMITTED/decision events and old history; no transaction/retry/budget changes. |
| BR-01 / NFR-02 → persistence | System SDS amount constraint; original SQL migration; F-05 Data | AC-L7-06 → STS-L7-08 | `prisma/schema.prisma` amountBaht is Int:150000 fits, so no Prisma type/model change. **A new additive SQL migration IS necessary** to replace the existing upper-bound CHECK with1–150000; do not edit an applied migration. Existing API tests exercise endpoint validation, not a dedicated direct-SQL range-constraint proof. Plan a targeted PostgreSQL constraint and populated-upgrade case; preserve IDs/fields/timestamps/events/sessions. |
| FR-06 → F-06 count-only | F-06 AC01–04, scoped groupBy | AC-L7-07 → STS-L7-09 | Counts depend on status/assignee, not amount; no implementation change. Existing summary regression protects counts. Approved-category totals remain Planned, not added here. |
| BR-01 → documentation/delivery | SRS BR-01; baseline historical§A/§E; F-05 validation/STS; traceability; README/handoff; Lab5 deployment guide | AC-L7-08 → STS-L7-10 | Future current SRS/contract/mapping updates link approved amendment; original baseline and D2 packet stay historical. Existing Dockerfile copies migrations and existing deploy runs `db:migrate` before service update. No Docker/CI/cloud/dependency change needed; verify image migration on owned populated target before release. |

Call graph checked with `rg`: no additional production caller of `parseExpenseInput` or `parseReturnedInput` was found. Summary/display/draft comparisons use the saved numeric amount and do not contain another range limit. Source-inspected migration coverage is not a live database constraint inventory; obtain that inventory on the owned rehearsal target before future writes.

## 5. Migration, delivery and rollback design (proposed)

Use a new timestamped migration, not a modification to `20261107000000_expense_requests/migration.sql`. Within a transaction, replace the named CHECK so its lower bound stays1 and its upper bound becomes150000. No row update/backfill, event insertion, status/revision change, precision conversion or new index is justified. Inspect the actual constraint definition and migration history; fail on an unexpected definition rather than silently modifying another database object. Test both a fresh migration chain and a populated pre-change database; compare exact domain snapshots immediately after migration, before intentional workflow writes. PostgreSQL INTEGER already represents the proposed range exactly.

Deployment order remains reviewed candidate → CI → staging integration → reviewed main → immutable image → existing required migration job succeeds → app service update → changed/preserved live checks. Old app instances still reject values above100000 during rollout; no claim of atomic fleet cutover. Expand the database first; verify the active revision before testing the new upper range. Keep existing secrets/Origin and portal-managed settings.

Rollback is not an automatic down-migration. Once a150000 row exists, reinstating the100000 CHECK would fail; never truncate/delete/alter those rows or history. Prefer a reviewed forward correction. If an application rollback is needed, retain the expanded database constraint and data; the older UI/server can still read larger saved amounts but cannot create/save them, which is a documented capability rollback requiring an explicit readiness decision. A later narrowing migration requires a separately approved data policy and verification that every existing amount meets it. No destructive rollback or shared database reset is authorized here.

## 6. Current stage and next handoff

Proposal prepared; instructor/TA and peer decisions PENDING; all future RED/GREEN/regression/CI/release/deployment/metrics results UNEXECUTED. [Evidence plan](evidence-plan.md) defines PartsA–D and future commands. Existing47API/19browser/Docker/deployment/D2 results remain historical at their recorded revisions; none proves this proposed amount limit.

ChatGPT assisted proposal/contract analysis; Codex inspected repository evidence and prepared these documents. chaproi remains responsible for selecting the proposal and obtaining instructor/TA approval and external peer review. No instructor/reviewer was contacted automatically.
