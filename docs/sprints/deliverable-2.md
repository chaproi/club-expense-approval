# Deliverable 2 — delivery and change register

## Current release/checklist correction — 26 November 2026

Use the [current five-area rubric, per-AC completion and release checklist](d2-completion-2026-11-26.md). Main cc6b04c8e98191be591a3b755d25988148523909 is source-reviewed, released and deployed; exact-main CI and our owner-directed live checks passed. Earlier pre-release tables/unchecked items below are retained as historical checkpoints. Their former demand for new independent deployed acceptance is superseded: it is **not a mandatory D2 gate**. [Lab 6 independent evidence](../labs/lab-06/retest-status-2026-11-26.md) is preserved separately. Student cover identity and concise contribution/AI-use declaration are confirmed; the [report PDF and inspection](../reports/deliverable-2/pdf-qa-2026-11-26.md) are complete. Owner final acceptance/submission remain unrecorded; a long personal reflection is optional.

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

The following five rows use the Project Deliverable 2 rubric supplied for this review. Parenthesized values are rubric weights. Evidence status does not assign earned marks or record submission acceptance. The baseline document's own A-E section names serve only as historical document organization.

| Project Deliverable 2 rubric | Evidence available with tested revision | Still required before submission |
|---|---|---|
| A Sprint 1 continuity and change status (5) | Corrected Sprint 1 baseline [43aa8d7](https://github.com/chaproi/club-expense-approval/blob/43aa8d7472aa8852654d0d634d7239c3765c5869/docs/sprint-1-baseline.md) remains identifiable. [Integration at 7175362](https://github.com/chaproi/club-expense-approval/blob/b05fb4d858f6e6d5ab2ef42b869b99eab4dfcb4b/docs/evidence/deliverable-2/integration-2026-11-26/evidence.md) reran the inherited approval/rejection, access and history coverage within 47 unit/API and 19 browser passes. [BF-01 correction](https://github.com/chaproi/club-expense-approval/blob/f487956511a79951656a2392bec002cde555ec67/docs/evidence/deliverable-2/f05-draft-recovery-bf01.md) and [dependency remediation](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md) retain actual change/test/review provenance. | Carry the change register, independent review decisions and retained Low limitations into the submission. Main release, deployment and deployed acceptance remain Pending. |
| B Sprint 2 contracts and working increment (25) | [F-04 contract](https://github.com/chaproi/club-expense-approval/blob/717536287117118d508e08d6cc68764a5df537c7/docs/contracts/f-04-return.md) and [F-05 v1.1 contract](https://github.com/chaproi/club-expense-approval/blob/717536287117118d508e08d6cc68764a5df537c7/docs/contracts/f-05-edit-resubmit.md) define Return/Edit/Resubmit, revision and draft recovery rules. [BF-01 RED/GREEN](https://github.com/chaproi/club-expense-approval/blob/f487956511a79951656a2392bec002cde555ec67/docs/evidence/deliverable-2/f05-draft-recovery-bf01.md) retains two behavioral failures then passing correction. [Integrated 7175362 results](https://github.com/chaproi/club-expense-approval/blob/b05fb4d858f6e6d5ab2ef42b869b99eab4dfcb4b/docs/evidence/deliverable-2/integration-2026-11-26/results.json) passed all mapped regression/browser cases after PR #43 approval and merge. | Peer-review this evidence packet and include the required normal/denied/conflict and durable-history demonstration evidence in the PDF. Outstanding manual UI/UAT observations and deployed increment acceptance remain Pending. |
| C Sprint 3 contracts and working progress (15) | [F-06 contract](https://github.com/chaproi/club-expense-approval/blob/717536287117118d508e08d6cc68764a5df537c7/docs/contracts/f-06-summary.md), [F-07 contract](https://github.com/chaproi/club-expense-approval/blob/717536287117118d508e08d6cc68764a5df537c7/docs/contracts/f-07-two-stage.md) and [F-08 contract](https://github.com/chaproi/club-expense-approval/blob/717536287117118d508e08d6cc68764a5df537c7/docs/contracts/f-08-status-filter.md) retain planned AC/STS and dependencies. [Feature progress and evidence](https://github.com/chaproi/club-expense-approval/blob/b05fb4d858f6e6d5ab2ef42b869b99eab4dfcb4b/docs/features.md) identifies working count-only F-06 AC01-04, covered by API/DB and browser tests at 7175362. | Present the count-only progress and its actual demonstration, and confirm the Sprint 3 plan in the submission. Category totals, two-stage approval and status filters remain planned Final work with no implementation/pass claim. |
| D Updated requirements and test traceability (10) | [Current SRS](https://github.com/chaproi/club-expense-approval/blob/717536287117118d508e08d6cc68764a5df537c7/docs/srs.md) retains requirement IDs. [Updated traceability](https://github.com/chaproi/club-expense-approval/blob/b05fb4d858f6e6d5ab2ef42b869b99eab4dfcb4b/docs/traceability.md) maps F-04/F-05/F-06 counts to actual tests, adds BF-01 AC-F05-08/09 and preserves planned Final coverage. [Integration case outcomes at 7175362](https://github.com/chaproi/club-expense-approval/blob/b05fb4d858f6e6d5ab2ef42b869b99eab4dfcb4b/docs/evidence/deliverable-2/integration-2026-11-26/results.json) records exact files, case names and results. | Check the final PDF's bidirectional requirement/AC/test/evidence links and retain all planned/unexecuted distinctions. Obtain independent review of this corrected completion table and documentation packet. |
| E Integrated release candidate (15) | Reviewed PR #43 head f487956 merged at 7ab4168, then reviewed PR #45 head d385c23 merged at 7175362. [Integration record and approval links](https://github.com/chaproi/club-expense-approval/blob/b05fb4d858f6e6d5ab2ef42b869b99eab4dfcb4b/docs/evidence/deliverable-2/integration-2026-11-26/evidence.md) records fresh 47/47 unit/API, 19/19 browser, TypeScript/build, Docker build and zero full/production audit findings on 7175362. [Populated upgrade on candidate a6c93ab](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md#populated-baseline-upgrade-on-the-new-candidate) retains its tested SHA; relevant bytes were verified equivalent to the merge. | Main release PR/approval and release SHA remain Pending. Deployment run, migration job, image/revision/traffic evidence, post-deploy workflow/data readback and independent deployed acceptance remain Pending. Include actual completed release evidence before claiming submission readiness. |

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
