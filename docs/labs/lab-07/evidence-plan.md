# Lab 7 evidence and readiness plan

27 November 2026 (Asia/Bangkok). [Proposal/approval record](proposal.md) / [proposed contract and STS](contract-proposed-v1.md). **Proposal only; all future execution results UNEXECUTED.** The supplied Lab7 rubric has PartsA/B/C/D weighted25/50/15/10. These are rubric points, not awarded marks. Due29November2026 at23:59Thailand; no extension or instructor approval is assumed.

## 1. A–D checklist and evidence IDs

Checkboxes describe evidence collected, not author/AI acceptance of the lab. Only preparation work is checked. Later records must retain exact commands, UTC timestamps with Bangkok interpretation, environment, source/dirty state, actual collected/executed/pass/fail/skip and cleanup. Future filenames/IDs below are prospective, not historical results.

| Part / weight | Required evidence and sequence | Present status |
|---|---|---|
| A Change impact and updated contract /25 | L7-A1 Issue with approved precise old/new behavior and baseline/pre-change identity; L7-A2 impact/caller/UI/API/DB table; L7-A3 versioned SRS/Feature SDS/System SDS/AC/STS amendment and independent review **before implementation** | Proposal/impact/STS prepared. Instructor/TA decision PENDING; peer review PENDING. No claim of completed PartA acceptance. |
| B Implementation and regression safe delivery /50 | L7-B1 tests-only commit and meaningful semantic RED on actual pre-change source; L7-B2 minimal source/UI/new constraint migration and same tests GREEN; L7-B3 unchanged regression, fresh/populated migration, TypeScript/build/Docker; L7-B4 substantive peer PR findings/disposition, latest-head CI, staging integration, reviewed main; L7-B5 existing migration-before-deploy job/revision and changed/preserved synthetic live checks | Every execution/review/integration/release/deployment result UNEXECUTED. No PR opened in proposal stage. |
| C Objective engineering metrics /15 | L7-C1 five dated definitions/values/source lists and compact evidence embedded for at least two values; L7-C2 interpretation at most100words with one named-owner action/milestone | Definitions below prepared; values and interpretation UNEXECUTED. No old47/19 run is a new Lab7 result. |
| D Release readiness and retrospective /10 | L7-D1 maintained-Sprint1-scope READY/NOT READY checklist, exact submitted/deployed identity, defects/debt, secrets/config/runbook and failures/skips; L7-D2 three short actual retrospective answers; L7-D3 truthful contribution/AI use and limitations | Current proposed scope NOT READY: approval/review and implementation/evidence absent. Later release verdict and retrospective UNEXECUTED. |

- [x] Inspect accepted Sprint1 rule, current implementation/callers and original database constraint; identify actual pre-change SHA.
- [x] Prepare explicit NOT EFFECTIVE old/new proposal, impact, AC/STS, migration rationale and future evidence plan before tests/code.
- [ ] Record actual instructor/TA approval, approver, time and evidence for both creation and inherited returned-edit scope.
- [ ] Record independent peer contract review and exact reviewed document SHA; resolve contract findings before implementation.
- [ ] Commit and run approved RED tests on pre-change production; preserve semantic versus infrastructure failures.
- [ ] Commit minimal GREEN separately; record same tests, affected regressions and all attempted results on actual source.
- [ ] Obtain substantive code/migration peer review and passing required CI; retain failed checks and reviewed SHA.
- [ ] Verify staging integration, reviewed main release, actual image/migration execution/service revision; preserve operational data.
- [ ] Execute selected larger-amount and preserved Sprint1 workflow/access live checks, using only authorized synthetic data.
- [ ] Freeze five metric windows/snapshot, embed sources, write at-most100-word interpretation and one action.
- [ ] Complete scoped readiness/defect/debt checklist, three short retrospective answers, contribution/AI use and one self-contained PDF.

Normal integration remains feature/fix documentation and implementation branches → current reviewed sprint staging → reviewed main → existing Lab5 pipeline. Before a future PR, choose/verify the active staging branch and integrate any newer reviewed work; do not reset an older staging/sprint-3 branch or recreate old feature branches. This proposal from current main does not authorize changing branch rules, merging or deployment. No teammate/instructor message is sent automatically.

## 2. Version and evidence ledger to populate after approval

| Identity / result | Value |
|---|---|
| Accepted Sprint1 |43aa8d7472aa8852654d0d634d7239c3765c5869; original Lab6 retest/acceptance version |
| Actual pre-change / current main |cc6b04c8e98191be591a3b755d25988148523909; live main fetch verified27Nov |
| Proposal/contract commit | This document publication; obtain immutable SHA from Git history, not a fabricated future value |
| Instructor/TA approval / peer contract review | PENDING; record person, decision, time, link and reviewed SHA |
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

Embed at least M1/M2 ID lists and M3's readable actual command/summary directly in the eventual PDF so two values can be reconciled offline. Include exact snapshot/window for each, even if the value is0. Use at most100words to explain one observed risk and one concrete action with owner/milestone; do not write invented post-implementation conclusions now. Prospective focus: verify that all three range-enforcement layers ship together and that declared approval/review sequence is evidenced. That is a planned risk check, not an observed failure of a new candidate.

## 4. Readiness, defects and debt

**Current verdict: NOT READY for the proposed maintained Sprint1 scope.** This is because the change is unapproved/unimplemented/unverified, not because an old released version has been retested and failed. The100000 contract/production remain in force. A future READY statement must apply only to the approved maintained scope, not the whole three-sprint product.

| Readiness item | Current state / owner and next action |
|---|---|
| Instructor approval and peer contract review | PENDING; chaproi obtains actual decisions before tests/implementation |
| Changed amount behavior + preserved Sprint1 paths | UNEXECUTED; implement only after gates; run planned boundary/security/domain cases |
| Database constraint/data preservation | UNEXECUTED; chaproi prepares reviewed additive migration and owned populated rehearsal after approval; no operational reset |
| Source review/CI/integration/release | UNEXECUTED; external peer reviews actual candidate, author records latest checks/integration |
| Configuration/secrets/setup | Existing secrets and pipeline unchanged by proposal; future candidate review must confirm no leak, valid private test target and unchanged Origin/deploy settings |
| Deployment and selected user checks | UNEXECUTED; reviewed main and actual job/revision evidence needed; original D2 deployment not relabelled |
| Documentation/PDF and final readiness | Proposal only; actual outputs, metrics, review text, old/new assessed excerpts and page map must be embedded once available |

| Known item | Classification / basis | Priority and disposition |
|---|---|---|
| OBS-TH038-01 cross-tab session UI | Inherited accepted Low observation at original Lab6 retest; backend denial remains enforced. Not newly retested here. | Preserve disclosure; separate scoped correction decision, not silently fixed by this amount change. |
| OBS-TH038-02 UTF-16 title counting | Inherited accepted Low discrepancy; current counting is retained. | Preserve disclosure and boundary tests; no Unicode-rule change in this proposal. |
| Prisma config deepmerge-ts8 scoped override | Existing documented compatibility/maintenance debt, not a fabricated new security defect; original remediation/audit results retain their source SHA. | Retain reviewed removal criteria and dependency caveat. No dependency change in Lab7 proposal. |
| Range duplicated across validator/UI/SQL | Source-observed consistency risk: three deliberate layers must agree. Not a present defect while all enforce100000. | Review all layers together and add changed-range evidence; no unrelated refactor or dependency needed. |
| New maintenance defects | No execution has occurred; no fresh “zero defects” claim. | Record only actually observed findings with severity/source/retest disposition. |

Three retrospective prompts (future student answers,1–2sentences each):

1. **What helped?** UNANSWERED until actual maintenance work; cite one concrete practice/result.
2. **What hurt?** UNANSWERED; cite actual friction/failure, not an invented story or assumption of slow hardware.
3. **What changes before Final?** UNANSWERED; choose one observed improvement and a named owner/next milestone.

This is a short engineering retrospective, not a required long personal essay. The earlier D2 contribution confirmation is historical; it is not approval of this proposal or a prewritten Lab7 reflection. Preserve solo/instructor-permission attribution and the external peer's actual role. ChatGPT/Codex assisted analysis and proposal preparation; neither can provide instructor approval, independent peer review or student acceptance.

## 5. Submission handoff (future, not performed)

Prepare one self-contained Lab7 PDF with A–D page ranges, readable approved excerpts/impact/review, actual RED/GREEN/code diff/regression/CI/release/deploy outcomes, five metric tables/sources and scoped readiness/three answers/contributions/AI use/limitations. Do not paste the unchanged entire SRS or application source. Include baseline/pre-change/submitted-main/revision table; safe account handoff remains private. Existing D2 packet, accepted versions and historical failures remain separate and unchanged. No PDF export, submission, PR, merge or deployment occurs in this proposal stage.
