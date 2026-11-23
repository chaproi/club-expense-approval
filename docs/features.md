# Feature inventory — current review candidate

24 Nov 2026. Contracts preceded code in c7539ee. Implementation/test status does not imply peer acceptance, main integration or deployment.

| Feature | Sprint / dependency | Contract | Implementation and actual verification | Acceptance / remaining work |
|---|---|---|---|---|
| F-01 | 1 | baseline §E | Existing auth/session/Origin and Lab6 fixes retained; regression PASS in 47-test suite | Historical release43aa8d7; new candidate deployment/retest pending |
| F-02 | 1 | baseline §E + F-05 revision | Submit/read/history/access regression PASS; valid SUBMITTED PATCH remains denied409 | Historical endpoint-absence404 superseded before code; candidate review pending |
| F-03 | 1 | baseline §E + F-04/F-05 revision | Approve/reject/readback + stale409 browser journeys PASS | Main release/retest pending |
| F-04 | 2 / F-03 | contracts/f-04-return.md | API, migration, UI, reason/history, access, race/revision and browser return loop implemented/tested | #35 / PR40+41; independent review/integration/release pending |
| F-05 | 2 / F-04 | contracts/f-05-edit-resubmit.md | Owner RETURNED-only edit/save/resubmit, dirty guard, same ID/history, restart/race/old-round checks implemented/tested | #36 / PR40+41; independent review/integration/release pending |
| F-06 counts | 3 / F-05 | contracts/f-06-summary.md AC01–04 | Assigned-Reviewer DB counts + zero/empty/scope/restart + actual UI refresh PASS | #37 / PR40+41; count-only checkpoint, review/release pending |
| F-06 totals | 3 / F-07 | contracts/f-06-summary.md AC05–06 | Specified, not implemented/tested | Final target4Dec |
| F-07 | 3 / F-03/F-05 | contracts/f-07-two-stage.md | Complete planned contract/AC/STS; not implemented/tested | Required Final, #38, target2Dec |
| F-08 | 3 / F-02/F-03/F-07 | contracts/f-08-status-filter.md | Complete planned contract/AC/STS; not implemented/tested | Required Final, #38, target3Dec |

Actual logs, source hashes, migration check, hosted screenshots and provenance: docs/evidence/deliverable-2. Review/release sequence: docs/reviewer-handoff.md. Full F-06 and full Sprint3 are not complete.
