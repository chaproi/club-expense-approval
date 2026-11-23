# Deliverable 2 — delivery and change register

24 Nov 2026. Issues #34–#38. Candidate not yet released/accepted/deployed.

Sprint allocation remains baseline v0.3: F-04/F-05 complete in Sprint2; F-06 counts plus all F-06–F-08 contracts by29Nov; full F-06–F-08 by13Dec.

| Finding/change | Source | Requirement | Disposition/current status | Release/retest |
|---|---|---|---|---|
| DEF-TH038-01/#30 | Independent Lab6 UAT | F-01 input validation | Resolved historically |43aa8d7 / s981b09c9-00007-9wq; independent PASS, candidate regression pending|
| DEF-TH038-02/#31 | Independent Lab6 UAT | F-01 canonical-host login |Resolved historically|same release; independent browser retest PASS, candidate regression pending|
| OBS-TH038-01 |Lab6 UAT|cross-tab session UI|Accepted Low limitation, not fixed here|disclose until separately tested fix|
| OBS-TH038-02 |Lab6 UAT|BR-01 title character count|Accepted Low UTF-16 limitation retained|disclose until separately reviewed change|
| CR-D2-01 |planned F-05|BR-06 / AC-04|Elaborate preallocated RETURNED-only editing; preserve denial outside RETURNED|contract version1.0 before code; test and release pending|
| Lab7 approved change|course §10|implemented rule/behavior|Approval dependency; no exercise approved or fabricated|not satisfied merely by F-04/F-05 backlog work|

Original D1 main4736879, corrected S1 main43aa8d7; new staging starts48d10cf (only two independently reviewed handoff documents beyond main). Keep both historical releases identifiable.

CI must cover PRs to staging/sprint-2 and staging/sprint-3 as well as existing paths. Retain required checks and the CI-gated main deployment. No unreviewed release or self approval.

Remaining targets: F-07 by2Dec, F-08 by3Dec, full F-06 totals by4Dec; known limitations/hardening5–7Dec; independent UAT8–10Dec; video/report/final release11–12Dec, submission13Dec. Owner chaproi; peer reviewer availability not assumed. Plan around exams1–11Dec and do not leave core workflows to12–13Dec.

Contribution: chaproi supervises and reviews AI-assisted contracts/code/tests; independent reviewer identity/results are recorded only when actually obtained.
