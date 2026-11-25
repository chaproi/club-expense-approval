# Deliverable 2 — delivery and change register

Updated 26 Nov 2026. The completion table and release checklist below record reviewed #43/#45 integration at 7175362. Main release and deployment acceptance remain pending.

The 24 Nov register for Issues #34–#38 follows as a historical checkpoint.

Sprint allocation remains baseline v0.3: F-04/F-05 complete in Sprint2; F-06 counts plus all F-06–F-08 contracts by29Nov; full F-06–F-08 by13Dec.

| Finding/change | Source | Requirement | Disposition/current status | Release/retest |
|---|---|---|---|---|
| DEF-TH038-01/#30 | Independent Lab6 UAT | F-01 input validation | Resolved historically |43aa8d7 / s981b09c9-00007-9wq; independent PASS, source regression PASS (hosted47 API+3 browser); deployed retest pending|
| DEF-TH038-02/#31 | Independent Lab6 UAT | F-01 canonical-host login |Resolved historically|same release; independent browser retest PASS, source regression PASS (hosted47 API+3 browser); deployed retest pending|
| OBS-TH038-01 |Lab6 UAT|cross-tab session UI|Accepted Low limitation, not fixed here|disclose until separately tested fix|
| OBS-TH038-02 |Lab6 UAT|BR-01 title character count|Accepted Low UTF-16 limitation retained|disclose until separately reviewed change|
| CR-D2-01 |planned F-05|BR-06 / AC-04|Elaborate preallocated RETURNED-only editing; preserve denial outside RETURNED|contract version1.0 before code; source tests PASS; independent review/release pending|
| Lab7 approved change|course §10|implemented rule/behavior|Approval dependency; no exercise approved or fabricated|not satisfied merely by F-04/F-05 backlog work|

Original D1 main4736879, corrected S1 main43aa8d7; new staging starts48d10cf (only two independently reviewed handoff documents beyond main). Keep both historical releases identifiable.

CI must cover PRs to staging/sprint-2 and staging/sprint-3 as well as existing paths. Retain required checks and the CI-gated main deployment. No unreviewed release or self approval.

Remaining targets: F-07 by2Dec, F-08 by3Dec, full F-06 totals by4Dec; known limitations/hardening5–7Dec; independent UAT8–10Dec; video/report/final release11–12Dec, submission13Dec. Owner chaproi; peer reviewer availability not assumed. Plan around exams1–11Dec and do not leave core workflows to12–13Dec.

Contribution: chaproi supervises and reviews AI-assisted contracts/code/tests; independent reviewer identity/results are recorded only when actually obtained.

Current source implementation/test status and sequential PR39→40→41 review/release gates: docs/reviewer-handoff.md. Full candidate acceptance remains pending.

## Current completion and release checklist, 26 November 2026

PR #43 and #45 source reviews and merges are verified. Fresh [integrated verification](../evidence/deliverable-2/integration-2026-11-26/evidence.md) passed on `717536287117118d508e08d6cc68764a5df537c7`. The original register above remains historical. BF-01, dependency and upgrade evidence are linked from the current integration record.

| Part from the repository baseline | Completion evidence | Remaining release work |
|---|---|---|
| A - SRS | docs/srs.md and docs/traceability.md retain FR/BR/NFR and executed mappings. Current regression passes. | Review PDF completeness, retain Final planned scope and limitations. |
| B - Feature inventory/dependencies | docs/features.md records F-04/F-05 and count-only F-06 source/integration status. | Full F-06 totals, F-07 and F-08 remain Final work. |
| C - System SDS | docs/system-sds.md and feature contracts describe layers, state, revision/authorization and persistence. Populated upgrade verified on candidate with identical relevant bytes. | Release migration/rollback execution evidence and post-deploy data readback. |
| D - Three-sprint plan | Original milestone allocation and change register retained. #43/#45 approved and integrated. | Reviewed main release, actual deployment and independent acceptance before completion/submission. |
| E - Feature contracts/AC/STS | Exact mapped tests passed 47 API/unit and 19 browser on 7175362, including BF-01. Historical Contract/RED/GREEN preserved. | Main/deployed checks, remaining manual UI/UAT coverage and Final AC stay pending. |

- [x] Verify reviewed heads, merge containment and source/dependency equivalence.
- [x] Execute requested integration tests/build/Docker/audits with actual results and cleanup.
- [x] Link populated baseline upgrade and preserve its candidate provenance.
- [ ] Independent review of this integration/documentation PR.
- [ ] Prepare a staging-to-main release PR with actual release SHA and required checks, obtain independent release approval.
- [ ] Execute approved deployment migration job and service update, record run, image digest/revision/traffic and serving commit.
- [ ] Perform post-deploy auth/owner/reviewer/return/edit/resubmit/history/summary and existing-data checks.
- [ ] Complete independent deployed acceptance and outstanding manual UI observations with actual expected/observed results.
- [ ] Assemble Parts A-E PDF with actual review/release evidence and student-authored reflection/contribution where required.
- [ ] Owner decides Deliverable 2 acceptance/submission after gates are supported.

Source approval is recorded for #43/#45. No main merge, deployment, issue closure or acceptance is claimed by this checklist.
