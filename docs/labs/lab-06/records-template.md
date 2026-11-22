# Lab 6 execution and acceptance records — templates only

**Template status: blank reusable forms, not the current execution ledger.**

These forms were prepared before UAT at documentation commit `402bf67ea94c840283241549b0284acc0248e858`. NOT EXECUTED, PENDING and NOT PERFORMED values below are placeholders in that original template, not statements about today's project progress. Actual received results and version-specific evidence are maintained separately in the partner's submitted report and the [correction/release record](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/docs/labs/lab-06/defect-correction.md). Final independent acceptance remains pending; do not sign or populate it from developer CI or smoke results. Formal review of these documents is retrospective and must retain its actual date.
Tracking [Issue #28](https://github.com/chaproi/club-expense-approval/issues/28).
Read [the TH-038 handoff and cases](handoff.md) first.

## A. Handoff receipt (complete with the actual partner)

| Field | Actual agreed value |
| --- | --- |
| Product / independent UAT team | TH-038 / TH-033_P3 |
| Participant names and identities | PENDING private course confirmation; record actual students in final PDF |
| Baseline application commit / serving revision | Proposed 1cc7df74c3f3240cff0c8a4d422f3f685a8acbce / recorded 00005-9sk; operator confirmation PENDING |
| Handoff document version / agreed cases | PENDING reviewed documentation commit; proposed UAT-01–UAT-09 |
| Private credential handoff | PENDING recipient/account labels/time/access acknowledgement; no passwords |
| Initial session / correction cutoff / independent retest session | PENDING agreement, Asia/Bangkok |
| Operator-coordinated UAT-08 restart window | PENDING authorized action and before/after version evidence |
| Data prefix / setup / cleanup acknowledgement | PENDING concrete RUN marker and retained synthetic IDs |

## B1. Independent results received for our product

One row per case/subcase and per execution/retest. Leave outcomes unexecuted until somebody actually runs the steps. During execution choose PASS, FAIL or BLOCKED, with a reason; BLOCKED is not a pass.

| Execution ID | Product team | Case/subcase | Tester name/team | Time/timezone | Application SHA/revision | Actual input/record IDs | Observed actual result | Outcome | Evidence IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Template only | TH-038 | NOT EXECUTED | PENDING TH-033_P3 tester | — | — | — | — | NOT EXECUTED | — |

## B2. TH-038's independent testing of TTworkshop

Keep these records separate from B1. First obtain TH-033_P3's agreed Sprint 1 cases, deployed version, reset instructions and private account handoff. Do not assume its repository main SHA is the running image: its README explicitly distinguishes the manual older deployment from source releases.

| Field | Partner confirmation |
| --- | --- |
| Product | TH-033_P3 / TTworkshop / https://github.com/cottonlnwza/TTworkshop |
| Baseline scope | F-01–F-04 is described in repository documents; accepted-for-test scope/ACs PENDING Product Team confirmation |
| Deployed URL / application SHA / revision | PENDING agreed handoff |
| Case plan / safe account labels / setup-cleanup | PENDING Product Team handoff; credentials private |
| TH-038 independent tester | chaproi; actual name/time recorded when executing |
| Test outcomes | NOT EXECUTED |

Use the same row structure as B1. The partner's expected results are inputs to execution, not actual observations. A source-code review, CI run or login-only checklist cannot replace independent manual UAT.

## C1. Outgoing reproducible finding template

- Finding/Issue ID and repository:
- Product owner/team:
- Reporter/tester/team, timestamp/timezone:
- Tested application SHA/revision and public URL:
- Original case and Sprint 1 requirement/AC:
- Preconditions, safe synthetic input and exact record IDs:
- Numbered reproduction actions:
- Expected behavior:
- Observed actual behavior:
- Severity (Critical/Major/Minor) and concrete user impact:
- Evidence IDs, including unchanged/protected state for access failures:
- Notification through the agreed partner handoff and acknowledged outcome:

Create a real defect Issue only for an actual observed finding. Do not invent a defect to populate this form.

## C2. All received findings and disposition

| Finding / linked Issue | Reporter / tested version / case | Classification | Evidence/contract reason | Severity / owner | Fix/disposition status | Independent retest / explicit limitation agreement |
| --- | --- | --- | --- | --- | --- | --- |
| No execution yet; received-findings count not determined | — | NOT TRIAGED | — | — | — | — |

For every actual received finding use accepted defect, duplicate, not-defect or enhancement, with a reason. Link duplicates to the original. A failing in-scope requirement cannot be relabelled as an enhancement. Record zero findings only after the actual findings handoff is complete.

## D1. Correction and independent retest chain

For each accepted defect fixed in this lab (or the separately TA-approved exercise), retain:
1. Original finding and defective deployed commit/revision.
2. Test file/name, relevant setup/assertion, exact RED command, tested commit and actual failing output/counts; it must fail for the reported behavior, not a fixture/syntax problem.
3. Fix branch from sprint staging, relevant code diff, exact GREEN command/commit/output and broader regression result.
4. Substantive independent PR review text, passing CI and integration, reviewed release into main, deployment run and corrected revision.
5. Actual post-deployment smoke checks, without secrets.
6. Partner's independent rerun of original failed and affected cases: tester, time/version, actual observations, result and evidence.
7. Final limitation agreement/closure and version-specific acceptance.

No natural defect: keep healthy-product independent acceptance separate, request instructor/TA approval for an isolated controlled exercise, and record approval, isolated version and the same correction chain. If a timely requested exercise/replacement tester remains unavailable, retain the notification and unresolved dependency. Do not replace it with the Lab 5 assert.fail test.

## D2. Version table

| Stage | Commit/tag | Deployment revision/run | Contract/case version | Actual verification / relationship |
| --- | --- | --- | --- | --- |
| Proposed initial TH-038 UAT baseline | 1cc7df74c3f3240cff0c8a4d422f3f685a8acbce | Recorded 00005-9sk / 44907366428 | Baseline §E; handoff draft | Operator confirmation pending; no UAT result |
| Actual defective version, if any | NOT DETERMINED | — | — | Do not fabricate |
| Reproducing test / corrected candidate | NOT PERFORMED | — | — | — |
| Corrected main / deployed fix, if needed | NOT PERFORMED | — | — | Explain legitimate merge-commit differences |
| Final independently tested release | NOT DETERMINED | — | — | Required in final decision |

## D3. Independent final acceptance record

**This form is unsigned and no decision has been made. Only the independent UAT Team records acceptance.**

- Product and Sprint 1 accepted-for-test scope/contract:
- Exact application commit/tag and deployed revision/run:
- Agreed cases, execution/retest records and actual PASS/FAIL/BLOCKED counts:
- All Critical/Major findings fixed and independently retested:
- Minor limitations and explicit UAT Team agreement:
- Remaining blocked cases/dependencies:
- Decision (choose only after actual UAT): Accepted / Accepted with explicitly documented minor limitations / Not Accepted
- Reasons, conditions and evidence:
- Independent tester names/team:
- Decision date/time/timezone and recorded confirmation/reference:

Unresolved Critical/Major defects or required BLOCKED cases prohibit acceptance. Acceptance is for the recorded Sprint 1 release only.

## E. Final PDF assembly checklist

- Contents table with Parts A–D, page ranges and evidence IDs.
- Complete handoff/cases plus relevant Sprint 1 contract sections embedded in the PDF.
- Both role responsibilities, identities, exact tested versions and actual results.
- All outgoing/received findings and reasoned dispositions; explicit zero only if actually established.
- Correction or approved-exercise RED/GREEN, code/review/CI/release/smoke/retest evidence embedded, not merely green icons/links.
- Independent exact-release decision, accepted minor limitations and unresolved dependencies.
- Short contribution table, AI-use declaration and limitations.
- Readable evidence captioned with action, expected/actual, time, tested commit/revision.
- Synthetic data only; no real credentials/cookies/tokens/connection strings.
- One self-contained PDF on LEB2 by 22 November 2026, 23:59 Asia/Bangkok; keep service/repository available through grading.
