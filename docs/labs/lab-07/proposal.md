# Lab 7 proposal: category-dependent whole-baht expense ceilings

Version **0.2**, 27 November 2026 (Asia/Bangkok). **PROPOSED / NOT EFFECTIVE; independent peer contract review PENDING.** Instructor/TA approval: **Not required under updated instructor announcement**. This is not personal approval. Production remains1–100000 for every category until a reviewed implementation is released. Implementation and all Lab7 RED/GREEN executions remain **UNEXECUTED**.

Same [Issue49](https://github.com/chaproi/club-expense-approval/issues/49) and [contract-review PR50](https://github.com/chaproi/club-expense-approval/pull/50). Author/owner: chaproi (นายสิริกร ฝันนิมิตร,67070507215,TH-038, Solo with previously documented instructor permission). ChatGPT/Codex assistance is not independent peer review.

## 1. Announcement, history and reference identities

The [student-supplied announcement](instructor-announcement-2026-11-27.md) is quoted verbatim with its evidence limits: publication date/URL were not supplied; no independent instructor-channel verification or personal approval is claimed. It removes the former instructor/TA gate. Independent peer contract review before implementation remains required.

The original uniform150000 proposal and its then-PENDING instructor gate are preserved at [12d40ecf571d50a012045b324d48ae50459c21eb](https://github.com/chaproi/club-expense-approval/commit/12d40ecf571d50a012045b324d48ae50459c21eb), in the [historical preparation record](preparation-validation-2026-11-27.md) and [Issue/PR snapshot](history/12d40ec-issue-pr-snapshot.json). This revision replaces the current proposal, not past decisions or execution evidence.

| Identity | Actual reference |
|---|---|
| Accepted Sprint1 | [43aa8d7472aa8852654d0d634d7239c3765c5869](https://github.com/chaproi/club-expense-approval/commit/43aa8d7472aa8852654d0d634d7239c3765c5869); original Lab6 acceptance/retest remains version-specific |
| Actual pre-change / last verified deployed main | [cc6b04c8e98191be591a3b755d25988148523909](https://github.com/chaproi/club-expense-approval/commit/cc6b04c8e98191be591a3b755d25988148523909); fetched main unchanged; no fresh cloud/live read |
| Branch / original base | docs/lab7-amount-limit-proposal from origin/maincc6b04c; original12d40ec remains an ancestor |
| Current PR base | staging/sprint-2 at ecab746d02b33a140775f53a5079bb7f57f5cd42; tree matches main d6598a339d79b8bf351025a1ad6c1060105e62a1. Sprint3 staging48d10cf remains older |
| Preserved D2 packet | [427d7c01ea9a62a5172a9a85ce4c6a9d48326e23](https://github.com/chaproi/club-expense-approval/commit/427d7c01ea9a62a5172a9a85ce4c6a9d48326e23); separate worktree/PDF filename work left untouched |
| Original Lab7 rubric |7pages, SHA-25613a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb; A/B/C/D25/50/15/10 and29November2026,23:59Thailand retained; instructor gate superseded as recorded above |

Intervening reviewed Return/Edit/Resubmit, revision handling, draft recovery/BF-01, scoped dependency overrides, campus UI and count-only F-06 remain protected regression scope. F-06 totals/F-07/F-08 remain Planned.

## 2. Student-proposed old-to-new policy

BR-01 currently accepts integer whole-baht1–100000 for all three categories. Proposed policy for **both F-02 creation and owner-authorized F-05 RETURNED Save**:

| Category | Proposed inclusive range | Maximum+1 rejected | Change |
|---|---|---|---|
| ACTIVITY |1–150000 |150001 | Raise maximum by50000 |
| EQUIPMENT |1–120000 |120001 | Raise maximum by20000 |
| TRAVEL |1–100000 |100001 | Keep original maximum |

**Student-proposed rationale:** distinguish activity planning, equipment purchases and travel requests while retaining bounded whole-baht values and existing approval workflow. The policy introduces category/amount dependency, category-switch validation and coordinated API/UI/SQL migration work. This is not a stakeholder request, instructor-selected policy or financial-authority approval. The peer must assess scope and sufficient complexity; publication does not certify acceptance.

Validate category and amount **together**:125000 is valid only for ACTIVITY;110000 is valid for ACTIVITY/EQUIPMENT but invalid for TRAVEL. Unknown/missing categories never use a permissive fallback. Reject category maximum+1,0,negative,fractional,missing/non-number amounts without domain writes; preserve title/enum/body-shape rules.

Both UI forms derive the amount max and readable feedback from the selected category. Switching to a lower maximum retains the selected category and entered amount, explains the invalid pair and prevents invalid submission. **Never clamp/reset an amount, save silently or mutate because a category changed.** Explicit correction or switching back restores validity. A draft's changed amount restored over a newer saved category may also be invalid: preserve it visibly, show feedback and require a valid explicit Save. Restore/Discard/refresh remain non-mutating; BF-01 clean-draft and explicit Resubmit behavior remain.

Keep session/role, ownership, Origin, server assignment, status/revision guards, atomic events, safe responses and guard order. SUBMITTED/APPROVED/REJECTED remain read-only. Existing rows stay valid because **every new category ceiling is at least100000**; no existing record/history is rewritten. No currency, precision, budget, transfer, totals, filter or two-stage feature is added.

## 3. Current review/status record

| Item | Current status | Evidence / remaining action |
|---|---|---|
| Instructor/TA change-request approval | **Not required under updated instructor announcement** | Student-supplied text recorded27November; publication date/URL unavailable; no personal Approved/approver/date claim |
| Independent peer contract review of revised policy | **PENDING before implementation** | Record substantive findings/disposition and exact reviewed SHA; old uniform-policy CI/review is not review of this revision |
| Implementation / RED / GREEN | **UNEXECUTED** | No source/test/migration/dependency change now |
| Final student/peer release acceptance | Not recorded | Not inferred from announcement or proposal publication |

If policy changes again, version it before implementing. Do not require the instructor/TA approval prerequisite removed by the announcement.

## 4. Actual source evidence and impact

Accepted43aa8d7 contains [BR-01/T-05](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/docs/sprint-1-baseline.md), [server100000 ceiling](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/server/src/expense-input.ts) and [named SQL CHECK](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/prisma/migrations/20261107000000_expense_requests/migration.sql). Current callers: POST→parseExpenseInput; PATCH Save→parseReturnedInput→parseExpenseInput. Revision-only Resubmit does not parse an amount. Both UI number inputs currently use max100000. These are inspected facts, not new behavioral execution.

All AC/STS are proposed/UNEXECUTED; see [contract v1.1](contract-proposed-v1.md).

| Requirement → feature | SRS / Feature SDS / System SDS | AC → planned STS | Actual modules / impact or no-change reason |
|---|---|---|---|
| BR-01 / FR-02 → F-02 | [SRS](../../srs.md) scope/BR-01; [baseline](../../sprint-1-baseline.md)§E F-02/AC-04–05; [System SDS](../../system-sds.md) screens/data | AC-L7-01/02/03 → STS-L7-01/02/03/05 | server/src/expense-input.ts; server/src/expense-requests.ts POST validation/message; client/src/expense-requests.tsx category/max/feedback; parser/API/browser cases. Validate pair, not global150000. |
| BR-01 / FR-05 / BR-05/06/09 → F-05 | [F-05](../../contracts/f-05-edit-resubmit.md) API/AC-F05-02/recovery; System SDS current additions | AC-L7-01/02/03/04 → STS-L7-01/02/04/06/07 | Shared returned parser and corrected category/amount form; same modules. Category-switch and restored-amount/latest-category mismatch cases; preserve revision/event/draft protocols. |
| NFR-01 / FR-01 / BR-02/03 → security | SRS security, baseline§C/§E and F-05 safety rules | AC-L7-05 → STS-L7-05/06/09 | server/src/auth.ts, request router/app guards. No session/authorization/Origin/DTO change justified. Test denials with valid pairs. |
| BR-04/05/06 / NFR-02 → workflow | System SDS conditional transactions; F-04/F-05 AC/STS | AC-L7-04/07 → STS-L7-04/06/07/09 | Router transactions; existing API races/browser recovery. Preserve atomic events and no invalid/stale write effects. |
| BR-01 / NFR-02 → persistence | System SDS CHECK/data; original migration; F-05 Data | AC-L7-06 → STS-L7-08/09 | New additive SQL replaces ExpenseRequest_amountBaht_check with category-dependent branches. Prisma Int/enum/model unchanged;150000 fits INTEGER. Direct SQL and fresh/populated tests required; applied migration untouched. |
| FR-06 → count-only | F-06 AC01–04/groupBy | AC-L7-07 → STS-L7-09 | Counts depend on status/assigned reviewer, not amount ceiling; no count-code change. Totals remain Planned. |
| BR-01 → delivery/docs | SRS/Feature/System SDS, traceability, README/handoff, Lab5 pipeline | AC-L7-08 → STS-L7-10 | Future current references adopt reviewed amendment; baseline/D2 history retained. Existing pipeline migrates before app update; no CI/cloud/dependency/pool/budget changes required. |

## 5. Proposed migration, delivery and rollback

A new timestamped migration transactionally replaces only the named CHECK with the contract's category-and-amount expression. Inspect actual constraint/migration history and fail on an unexpected definition; validate existing pairs. No data backfill, field/event/timestamp/revision rewrite, type/enum change or new index. Source inspection is not a live database inventory.

Prove fresh migration and a separate populated pre-change target with all categories and old boundaries. Compare exact domain snapshots immediately after migration before intentional workflow writes. Every valid old pair fits the new policy because all ceilings are at least100000. Independent direct-SQL insert/update checks complement API tests.

Reviewed candidate→CI→staging→reviewed main→immutable image→required migration succeeds→service update→changed/preserved checks. Old app instances may reject larger values during rollout; do not claim fleet-atomic switch. Verify serving revision before asserting the policy; preserve secrets/Origin/portal settings.

Rollback never deletes/clamps larger amounts. Restoring the old100000 CHECK fails if ACTIVITY/EQUIPMENT rows exceed it; other future category narrowing can also conflict with saved pairs. Prefer reviewed forward correction. App-only rollback retains the new CHECK/data: older code reads larger values but cannot create/save them, a disclosed capability rollback needing a readiness decision. Any narrowing migration requires a separately reviewed data policy and proof all pairs conform. Never reset shared data or edit applied migrations.

## 6. Next handoff

Peer reviews this revised category policy and its AC/STS before RED/implementation. Instructor/TA approval is no longer a prerequisite. All maintenance executions/metrics/release results stay UNEXECUTED; old47API/19browser and D2 deployment retain original provenance. [Evidence plan](evidence-plan.md) defines subsequent work; [revision record](category-policy-revision-2026-11-27.md) records this batch. No instructor/reviewer messages are sent automatically.
