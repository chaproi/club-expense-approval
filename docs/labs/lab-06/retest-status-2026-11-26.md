# Lab 6 evidence status, verified 26 November 2026

This is a status reconciliation of existing evidence, not a new UAT execution. **No additional external peer acceptance is imposed as a Deliverable 2 gate.** The original Lab 6 independent UAT/retest remains a separate, version-specific course record.

## Established incoming independent UAT and retest

Live [Issue #30](https://github.com/chaproi/club-expense-approval/issues/30) and [Issue #31](https://github.com/chaproi/club-expense-approval/issues/31), both already closed, record:

- Original TH-033_P3 team: cottonlnwza and thananun-7203. Original application 1cc7df74c3f3240cff0c8a4d422f3f685a8acbce; document 402bf67ea94c840283241549b0284acc0248e858. Their 18 scripted subcases passed, with two exploratory failures and two Low observations. This is not 20 initial passes.
- Original private archive TH038_UAT_Evidence_TH033P3.zip, SHA-256 f13a83e5b682700e25054a44fd46827bf282e6824c674546b0c73f2d7299ea34: 20 CSV rows, report, two JSON files and 22 screenshots.
- Corrections were source-reviewed in [PR #32](https://github.com/chaproi/club-expense-approval/pull/32); [PR #33](https://github.com/chaproi/club-expense-approval/pull/33) released main **43aa8d7472aa8852654d0d634d7239c3765c5869**.
- [Deployment 45027407173](https://github.com/chaproi/club-expense-approval/actions/runs/45027407173), revision **s981b09c9-00007-9wq**. Independent retest window: 22 Nov 2026, **21:18:04–21:19:15 Asia/Bangkok**; executor thananun-7203.
- DEF-TH038-01: original NUL/high-surrogate inputs returned exact 400 INVALID_INPUT; wrong-password control remained401. DEF-TH038-02: alias navigation returned308 preserving query; real canonical browser login passed.
- Shared regression covered me200, retained rejected U08 record/history, protected Lab 5 record, Origin403, logout204 and session replay401.
- Retest archive TH038_Retest_Evidence_TH033P3.zip, SHA-256 245266a71a9de1a05d03490e23c7f85c121a18341f0f10593b7cab1bcc0d6f67, contains E-RETEST-00007-9wq.json, E-RETEST-DEF02-01.png and updated 22-row CSV. It retains both earlier failures and adds two passing retests.
- Final team decision at 21:19 Bangkok on 22 Nov: **Accepted with explicitly documented minor limitations**, scoped to Sprint 1 F-01–F-03 / AC-01–AC-10 on that exact release. Zero unresolved Critical/Major/Medium defects or BLOCKED cases were reported.
- Accepted Low limitations remain: cross-tab session UI can remain signed in after backend401 until reload; title length uses JavaScript UTF-16 units. Neither is falsely marked fixed.

The [original triage/correction](defect-correction.md), [handoff](handoff.md), [records template](records-template.md), all original local RED/GREEN logs and private archive identities are preserved. Their original Pending/Conditional wording describes the preparation/correction checkpoint and is superseded only by the later retest facts above.

## What remains separate or unavailable

There is no demonstrated outstanding incoming defect/retest gate for those two Lab 6 findings. The repository does not contain the full private tester archives, student/team receipt/signature material or the final Lab 6 course PDF. Their assembly/access status cannot be certified from the public issue summaries. If a Lab 6 submission requires those materials, obtain the existing originals privately with appropriate redaction; do not manufacture executions or republish credentials.

Reciprocal TTworkshop testing is a different product. This reconciliation does not establish its final report/restart subcase status. Instructor-specific Lab 6 submission and reciprocal obligations, if outstanding, must be checked against that separate handoff. They are not newly invented D2 acceptance requirements.

## Deliverable 2 distinction

Main **cc6b04c8e98191be591a3b755d25988148523909** and [the 26 Nov deployed checks](../../evidence/deliverable-2/postdeploy-2026-11-26/evidence.md) are a later release and **owner-directed automated verification**. The historical peer acceptance is not extended to that release, and a new external UAT is not mandatory for D2. Completed technical checks support the owner's final D2 decision; they do not record that decision or final submission.
