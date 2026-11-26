# Lab 7 evidence and readiness plan

Revision0.2,27 November 2026 (Asia/Bangkok). [Current proposal](proposal.md) / [proposed category contract v1.1 and STS](contract-proposed-v1.md). **Proposal only; implementation and all RED/GREEN results UNEXECUTED.** Instructor/TA approval: **Not required under updated instructor announcement** ([student-supplied evidence and limits](instructor-announcement-2026-11-27.md)); not Approved. Independent peer contract review before implementation remains PENDING. The supplied Lab7 rubric has PartsA/B/C/D weighted25/50/15/10; weights are not awarded marks. Due29November2026 at23:59Thailand; no extension claimed. [Original plan](https://github.com/chaproi/club-expense-approval/blob/12d40ecf571d50a012045b324d48ae50459c21eb/docs/labs/lab-07/evidence-plan.md) retains its superseded instructor gate and uniform150000 proposal.

The current **student-proposed** policy is ACTIVITY1–150000, EQUIPMENT1–120000, TRAVEL1–100000 on creation and owner-authorized RETURNED Save. The instructor announcement removes a prerequisite; it does not select this policy or certify its complexity. Peer review must assess that point along with paired validation, category-switch/no-clamp feedback, draft interactions, preservation and rollback.

## 1. A–D checklist and evidence IDs

Checkboxes describe evidence collected, not author/AI acceptance of the lab. Only preparation work is checked. Later records must retain exact commands, UTC timestamps with Bangkok interpretation, environment, source/dirty state, actual collected/executed/pass/fail/skip and cleanup. Future filenames/IDs below are prospective, not historical results.

| Part / weight | Required evidence and sequence | Present status |
|---|---|---|
| A Change impact and updated contract /25 | L7-A1 Issue with precise student-proposed old/new pairs and baseline/pre-change identity; supplied announcement with provenance limits; L7-A2 impact/caller/UI/API/DB table; L7-A3 versioned SRS/Feature SDS/System SDS/AC/STS and substantive independent review **before implementation** | Revised proposal/impact/STS prepared. Instructor/TA approval Not required under updated instructor announcement; peer review PENDING. No PartA acceptance claimed. |
| B Implementation and regression safe delivery /50 | L7-B1 tests-only semantic RED on actual pre-change source; L7-B2 minimal pair-aware server/UI/new CHECK migration and same tests GREEN; L7-B3 unchanged regression, category-switch/recovery cases, fresh/populated migration, TypeScript/build/Docker; L7-B4 substantive code PR review/CI/staging/reviewed main; L7-B5 migration-before-deploy and changed/preserved synthetic checks | Implementation and all RED/GREEN/release results UNEXECUTED. Existing PR50 is documentation-only contract review; any proposal CI tests unchanged production, not the new policy. |
| C Objective engineering metrics /15 | L7-C1 five dated definitions/values/source lists and compact evidence embedded for at least two values; L7-C2 interpretation at most100words with one named-owner action/milestone | Definitions below prepared; values and interpretation UNEXECUTED. No old47/19 run is a new Lab7 result. |
| D Release readiness and retrospective /10 | L7-D1 maintained-Sprint1-scope READY/NOT READY checklist, actual release identity, defects/debt/config and failures/skips; L7-D2 three short actual retrospective answers; L7-D3 truthful contribution/AI use/limits | Current proposal NOT READY for release: revised peer review and implementation/evidence absent. Instructor gate is removed. Later verdict/retrospective UNEXECUTED. |

- [x] Inspect accepted Sprint1 rule, current implementation/callers and original database constraint; identify actual pre-change SHA.
- [x] Prepare explicit NOT EFFECTIVE old/new proposal, impact, AC/STS, migration rationale and future evidence plan before tests/code.
- [x] Record supplied announcement and its source limits: instructor/TA approval Not required under updated instructor announcement, not Approved; preserve earlier Pending record as history.
- [ ] Record independent peer contract review and exact reviewed document SHA; resolve contract findings before implementation.
- [ ] After substantive peer contract review, commit and run revised-policy RED tests on pre-change production; preserve semantic versus infrastructure failures.
- [ ] Commit minimal GREEN separately; record same tests, affected regressions and all attempted results on actual source.
- [ ] Obtain substantive code/migration peer review and passing required CI; retain failed checks and reviewed SHA.
- [ ] Verify staging integration, reviewed main release, actual image/migration execution/service revision; preserve operational data.
- [ ] Execute selected larger-amount and preserved Sprint1 workflow/access live checks, using only authorized synthetic data.
- [ ] Freeze five metric windows/snapshot, embed sources, write at-most100-word interpretation and one action.
- [ ] Complete scoped readiness/defect/debt checklist, three short retrospective answers, contribution/AI use and one self-contained PDF.

Normal integration remains feature/fix documentation and implementation branches → current reviewed sprint staging → reviewed main → existing Lab5 pipeline. Before a future PR, choose/verify the active staging branch and integrate any newer reviewed work; do not reset an older staging/sprint-3 branch or recreate old feature branches. This proposal from current main does not authorize changing branch rules, merging or deployment. No teammate/instructor message is sent automatically.

## 2. Version and evidence ledger to populate after peer contract review

| Identity / result | Value |
|---|---|
| Accepted Sprint1 |43aa8d7472aa8852654d0d634d7239c3765c5869; original Lab6 retest/acceptance version |
| Actual pre-change / current main |cc6b04c8e98191be591a3b755d25988148523909; live main fetch verified27Nov |
| Proposal/contract commit | This document publication; obtain immutable SHA from Git history, not a fabricated future value |
| Instructor/TA approval | Not required under updated instructor announcement; no personal approval/date/URL fabricated |
| Independent peer contract review | PENDING for revised policy; record person, findings/disposition, time, link and exact reviewed SHA |
| RED test commit and run | UNEXECUTED |
| GREEN source and run | UNEXECUTED |
| Regression/CI/staging/main | UNEXECUTED for this maintenance change |
| Image/migration job/revision/traffic | UNEXECUTED for this maintenance change; historicalcc6b04c deployment is not a new Lab7 release |
| Selected post-deploy checks | UNEXECUTED |

Future evidence must connect original baseline, actual tested pre-change SHA, test/code/evidence commits, reviewed PR, merge/test-merge SHA if different, integrated source and serving revision. Explain merge-only differences rather than silently relabelling test execution. Preserve all initial failed/skipped/unreached assertions and artifact bytes. Store only sanitized logs/results; private credentials/cookies/tokens and full connection values never enter Git/PDF.

## 3. Five metric definitions

Common activity window begins **2026-11-27T00:00:00+07:00** and ends at an explicitly recorded final Lab7 evidence-freeze timestamp, no later than the actual submission snapshot. The end is not known yet; enter it exactly when collecting. A snapshot-only measure states its exact time separately. Scope is **chaproi/club-expense-approval only**, not TokTickIT or another product. Values remain **UNEXECUTED / not collected**, not assumed zeros.

| Metric | Definition / scope / window | Future source and reconciliation rule | Value now |
|---|---|---|---|
| M1 Completed Issues | Count distinct non-PR Issues completed within the common window; list maintenance versus other project work separately. Duplicates/cancelled/not-planned closures excluded from “completed” and listed separately. | GitHub Issue IDs, title, close reason/time and disposition. Embed complete compact ID/date list and exclusions (L7-C1-I). Proposal existence is not completion. | UNEXECUTED |
| M2 Merged PRs | Count distinct merged PRs in common window, separated by target staging/main and maintenance versus unrelated scope; unmerged/closed PRs excluded. | GitHub PR ID/head/base/merge SHA/merge time table (L7-C1-P). A staging PR and later release PR are separate recorded PRs, not two distinct completed features. | UNEXECUTED |
| M3 Automated results | Vector collected/executed/passed/failed/skipped/cancelled for **one named complete `npm.cmd test` unit/API run on the final maintenance source candidate**, with exact command/SHA/runtime. Browser run is separately reported, not added to manufacture a single suite total. | Raw sanitized summary and actual per-file/test inventory (L7-C1-T). Include every failed attempt elsewhere; selecting a final regression result never erases its predecessors. | UNEXECUTED |
| M4 Defect status | Snapshot at final freeze: known defects grouped by severity and open/resolved/deferred, listing IDs and release/retest basis. “Resolved” requires implemented correction plus relevant recorded retest, not closed label alone. | Existing Lab6 DEF/OBS IDs, new defects if actually found, Issue/PR/retest links and dates (L7-C1-D). Distinguish inherited accepted Low limitations from new maintenance defects and debt. | UNEXECUTED; inherited historical limitations known, no fresh census claimed |
| M5 CI outcomes | All CI and deploy workflow runs in common window whose head/PR contains the proposed maintenance change; list successful/failed/cancelled/timed-out/other and still-running separately. Count workflow runs by run ID+attempt; nested reusable jobs are not additional runs. | GitHub run ID/attempt/workflow/branch/SHA/times/conclusion table (L7-C1-C). Any success percentage states numerator and completed-run denominator, preserving cancelled/other treatment explicitly. | UNEXECUTED |

Embed at least M1/M2 ID lists and M3's actual command/summary directly in the eventual PDF so two values can be reconciled offline. Include each exact snapshot/window, even for0. Use at most100words for one observed risk/action with owner/milestone; no invented future conclusion. Prospective focus: all three pair-validation layers must ship together, no-clamp category switches must preserve user intent, and actual peer review must precede implementation. No instructor approval is needed. This is a planned risk check, not an observed new-candidate failure.

## 4. Readiness, defects and debt

**Current verdict: NOT READY for the proposed maintained Sprint1 scope.** Revised independent peer contract review, implementation and verification are absent; instructor/TA approval is Not required under updated instructor announcement. This is not a failed retest of old production. The uniform100000 production contract remains in force. Future READY concerns only the maintained scope, not the whole product.

| Readiness item | Current state / owner and next action |
|---|---|
| Announcement and peer contract review | Instructor gate removed with supplied-evidence limits; revised peer review PENDING before RED/implementation |
| Changed amount behavior + preserved Sprint1 paths | UNEXECUTED; implement only after gates; run planned boundary/security/domain cases |
| Database constraint/data preservation | UNEXECUTED; after peer contract review, prepare additive category CHECK and fresh/populated rehearsal; all old category caps were100000, so existing valid rows need no rewrite; no operational reset |
| Source review/CI/integration/release | UNEXECUTED; external peer reviews actual candidate, author records latest checks/integration |
| Configuration/secrets/setup | Existing secrets and pipeline unchanged by proposal; future candidate review must confirm no leak, valid private test target and unchanged Origin/deploy settings |
| Deployment and selected user checks | UNEXECUTED; reviewed main and actual job/revision evidence needed; original D2 deployment not relabelled |
| Documentation/PDF and final readiness | Proposal only; actual outputs, metrics, review text, old/new assessed excerpts and page map must be embedded once available |

| Known item | Classification / basis | Priority and disposition |
|---|---|---|
| OBS-TH038-01 cross-tab session UI | Inherited accepted Low observation at original Lab6 retest; backend denial remains enforced. Not newly retested here. | Preserve disclosure; separate scoped correction decision, not silently fixed by this amount change. |
| OBS-TH038-02 UTF-16 title counting | Inherited accepted Low discrepancy; current counting is retained. | Preserve disclosure and boundary tests; no Unicode-rule change in this proposal. |
| Prisma config deepmerge-ts8 scoped override | Existing documented compatibility/maintenance debt, not a fabricated new security defect; original remediation/audit results retain their source SHA. | Retain reviewed removal criteria and dependency caveat. No dependency change in Lab7 proposal. |
| Range policy across server/UI/SQL | Source-observed consistency risk: all layers must agree on category/amount pair; no present defect while all enforce old100000. | Review literal per-category max/max+1/cross-pairs, switches and restored drafts; never silently clamp or rewrite data. No unrelated refactor/dependency. |
| New maintenance defects | No execution has occurred; no fresh “zero defects” claim. | Record only actually observed findings with severity/source/retest disposition. |

Three retrospective prompts (future student answers,1–2sentences each):

1. **What helped?** UNANSWERED until actual maintenance work; cite one concrete practice/result.
2. **What hurt?** UNANSWERED; cite actual friction/failure, not an invented story or assumption of slow hardware.
3. **What changes before Final?** UNANSWERED; choose one observed improvement and a named owner/next milestone.

This is a short engineering retrospective, not a required long essay. The earlier D2 contribution confirmation is historical, not approval of this proposal or a prewritten Lab7 reflection. Preserve solo permission/external peer attribution. ChatGPT/Codex assisted analysis/docs; neither provides independent peer review or student acceptance. The instructor announcement is student-supplied evidence removing the former gate, not AI approval.

## 5. Submission handoff (future, not performed)

Prepare one self-contained Lab7 PDF with A–D page ranges, supplied announcement/provenance and peer-reviewed excerpts/impact/review, actual RED/GREEN/code diff/regression/CI/release/deploy, five metric sources and scoped readiness/three answers/contributions/AI use/limits. Do not paste unchanged full SRS/app source. Include baseline/pre-change/main/revision table and private safe-account handoff. Existing D2/historical evidence remains separate. PR50 stays the same contract-review PR; no duplicate PR, implementation, RED/GREEN, PDF export, merge, submission or deployment in this revision batch.
