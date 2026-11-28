# Feature inventory — current review candidate

**Current Lab7 candidate,27 November 2026:** F-02 creation and F-05 owner RETURNED Save now implement paired ceilings ACTIVITY150000/EQUIPMENT120000/TRAVEL100000, integer minimum1, with retained category-switch values, linked range feedback and unchanged draft reconciliation. [Lab7 local GREEN evidence](labs/lab-07/green-verification-2026-11-27.md) records184/184 unit/API and23/23 browser, build/Docker and fresh/populated/image verification. Independent code review, integration and new-policy deployment remain Pending; F-06 totals,F-07,F-08 remain Planned. Historical D2 checkpoint rows below retain their original source/result attribution.

24 Nov 2026 baseline, updated 26 Nov 2026 after reviewed PRs #43/#45 and staging integration. Contracts preceded code in c7539ee. Implementation/test status does not imply peer acceptance, main integration or deployment.

| Feature | Sprint / dependency | Contract | Implementation and actual verification | Acceptance / remaining work |
|---|---|---|---|---|
| F-01 | 1 | baseline §E | Existing auth/session/Origin and Lab6 fixes retained; regression PASS in 47-test suite | Historical release43aa8d7; new candidate deployment/retest pending |
| F-02 | 1 | baseline §E + F-05 revision | Submit/read/history/access regression PASS; valid SUBMITTED PATCH remains denied409 | Historical endpoint-absence404 superseded before code. Current staging source reviewed/integration-tested, main release acceptance pending |
| F-03 | 1 | baseline §E + F-04/F-05 revision | Approve/reject/readback + stale409 browser journeys PASS | Main release/retest pending |
| F-04 | 2 / F-03 | contracts/f-04-return.md | API, migration, UI, reason/history, access, race/revision and browser return loop implemented/tested | #35 / PR40+41 integrated into Sprint 2 staging. Release pending. |
| F-05 | 2 / F-04 | [F-05 v1.1](contracts/f-05-edit-resubmit.md) | Original #36 RETURNED-only edit/Save/Resubmit and revision/history protections are integrated into Sprint 2 staging. [Issue #42](https://github.com/chaproi/club-expense-approval/issues/42) draft recovery is implemented and tested PASS for AC-F05-07–11 at [`ffefb2d`](https://github.com/chaproi/club-expense-approval/commit/ffefb2da0c812f5dee17309cefcfd3e01b30313e). [GREEN evidence](evidence/deliverable-2/f05-draft-recovery-green.md). | #42 source approved in PR #43 and merged at 7ab4168. Integration checks PASS at 7175362. Main release/deployment acceptance pending |
| F-06 counts | 3 / F-05 | contracts/f-06-summary.md AC01–04 | Assigned-Reviewer DB counts + zero/empty/scope/restart + actual UI refresh PASS | #37 / PR40+41 count-only checkpoint integrated into Sprint 2 staging. Release pending. |
| F-06 totals | 3 / F-07 | contracts/f-06-summary.md AC05–06 | Specified, not implemented/tested | Final target4Dec |
| F-07 | 3 / F-03/F-05 | contracts/f-07-two-stage.md | Complete planned contract/AC/STS; not implemented/tested | Required Final, #38, target2Dec |
| F-08 | 3 / F-02/F-03/F-07 | contracts/f-08-status-filter.md | Complete planned contract/AC/STS; not implemented/tested | Required Final, #38, target3Dec |

Actual logs, source hashes, migration check, hosted screenshots and provenance: docs/evidence/deliverable-2. Review/release sequence: docs/reviewer-handoff.md. Full F-06 and full Sprint3 are not complete.

Current integration at `717536287117118d508e08d6cc68764a5df537c7` passed 47 unit/API and 19 browser cases, TypeScript/build, Docker build and both audits. Dependency source review passed in PR #45 and merged at this SHA. See [integrated evidence](evidence/deliverable-2/integration-2026-11-26/evidence.md). [BF-01 RED and GREEN](https://github.com/chaproi/club-expense-approval/blob/f487956511a79951656a2392bec002cde555ec67/docs/evidence/deliverable-2/f05-draft-recovery-bf01.md) and [dependency verification](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md) retain their original executions. Full F-06/F-07/F-08 remain planned as listed above.
