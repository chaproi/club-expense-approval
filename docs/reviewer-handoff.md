# Deliverable 2 — independent reviewer handoff

24 Nov 2026 / chaproi. **Ready for source review; not yet an accepted/deployed Sprint 2 release.** Do not merge evidence-only PR17.

## Review and integration order

| Order | PR / issue | Scope | Current evidence / gate |
|---|---|---|---|
| 1 | [PR39](https://github.com/chaproi/club-expense-approval/pull/39) / #34 | Complete S2/S3 contracts, full SRS/SDS/inventory/matrix and CI targets | Headc7539ee; CI45235767973 SUCCESS; independent design/workflow review pending |
| 2 | [PR40](https://github.com/chaproi/club-expense-approval/pull/40) / #35/#36/#37 | Additive schema + revision-safe return/edit/resubmit + assigned DB counts | Headfeea765; CI45236047280 SUCCESS:47 API,2 original browser, build/Docker; review pending |
| 3 | [PR41](https://github.com/chaproi/club-expense-approval/pull/41) / #35/#36/#37 | Complete new UI and combined browser loop, explicit self/overflow verification, retained evidence and current docs | UI source830346b: CI45237202381 SUCCESS:47 API+3 browser+build/Docker; final follow-up exact-head CI required |

The stack shares identical parent commits. Integrate using merge commits in order, so later diffs narrow and provenance remains intact; recheck the base diff/head/CI before each approval/merge. A squash/rebase requires deliberate rebase/reverification of dependent branches. CI for each source alone is not a substitute for checks on the integrated staging/main candidate.

Review six areas with actual findings: (1) requirement/contract/AC scope and revisions, (2) state and stale-round rules, (3) transaction/migration/history retention, (4) role/ownership/self/Origin and private DTOs, (5) meaningful RED/GREEN, boundary/race/regression/browser evidence, (6) UI behavior, CI/deploy/readiness and remaining Final work. Record reviewer identity, reviewed SHA, findings/disposition and decision in GitHub. No author/AI self-approval counts as independent review.

## Evidence already available

- Contracts preceded implementation in c7539ee. RED test commit18795b7 and recorded output7ff574c:13 new tests fail on old behavior; no production fix in RED.
- GREEN API sourcefeea765:47/47 pass with real PostgreSQL; unchanged runtime assertions with one disclosed TypeScript const annotation. The historical missing-endpoint PATCH404 changed to valid SUBMITTED edit409 as specified before code.
- `docs/evidence/deliverable-2/migration-compatibility.json`:3 old request rows and3 old event rows exact after additive migration, new revision0. This used an isolated DB; the assessed Cloud SQL data was not reset/seeded.
- `hosted-ci-excerpts.md` and `hosted-45237202381/`: actual CI/browser output and two synthetic screenshots; original failed UI run retained in the evidence narrative, corrected label kept the same test assertion.
- `final-api-verification.log`:47/47 local, including explicit self-return and int32-exhaustion assertions. Local browser launch policy failures are retained separately and never counted as passes.
- Current full requirements/feature/AC/test mappings are in `docs/srs.md`, `docs/features.md`, `docs/system-sds.md`, `docs/traceability.md`; all five feature contracts are complete documents under `docs/contracts`.

## Reviewer demos / remaining checks

1. Reviewer returns an assigned SUBMITTED request with reason; owner reads same ID/reason/history. Other users and invalid reasons cannot change it.
2. Owner edits a RETURNED request; unsaved changes disable Resubmit, Save persists fields, Resubmit uses new revision, reviewer approves the new round, owner reads all five events. Old/replayed commands409 without extra event.
3. Reviewer summary uses assigned current DB records, with correct zeros and counts after each transition. Requester cannot call/read summary. F-06 sums and two-stage/filter features are still planned.
4. Manually inspect new loading/empty/error/pending/conflict UI states. Hosted successful journeys are not evidence for every transient UI condition. Recheck exact version and integrated access/persistence after release.

## Release gate after independent peer approval

- Review/integrate39→40→41 into staging/sprint-2; rerun integration checks. Record a reviewed Sprint2 release identity before any later Sprint3 release changes it. Count-only F-06 progress is deliberately included and must be labelled as such.
- Open the reviewed staging→main release PR, obtain real peer approval and green required checks; record immutable merged main SHA. No direct unreviewed merge/deploy is claimed here.
- Existing main deploy workflow runs reusable CI, builds/pushes image, executes required migration job, then deploys Cloud Run. Record actual run, migration success, revision, digest, traffic and serving version; preserve existing data.
- Post-deploy: health/login/session/logout, old approve/reject, return/edit/resubmit, summary scope/counts, denied owner/role/Origin and old-data readback. Capture expected/actual with time and exact release. Do not use isolated synthetic migration results as proof of the shared deployed DB.
- Finalize the one self-contained PDF only after inserting review/release/deployed evidence. Include Parts A–E, all current docs/contracts, two meaningful test excerpts, two Issue/PR chains, selected demos, output and remaining plan. D2 due29Nov23:59 Bangkok; target submit20:00.

## Board and remaining dependencies

[Project board](https://github.com/users/chaproi/projects/4) verified: auto-add contains Issues34–38 and PR39–41 in Backlog. Current columns are Backlog/Specified/Started/PRReview/Fixing/Done. Public signed-out view cannot move cards; update using the owner's signed-in session. Source-complete cards belong in review, never Done before their release/acceptance gate. No board movement is claimed.

F-06 sums target4Dec; F-07 two-stage approval target2Dec; F-08 status filters target3Dec; integration/hardening5–7Dec; independent UAT8–10Dec; final video/report/release11–12Dec; final submission13Dec. Both two-stage approval and filters remain required. Lab7 approved maintenance change remains a separate instructor/TA approval dependency. Existing cross-tab logout/UTF-16 title-count observations remain disclosed Low limitations.

Contribution: chaproi directs and inspects AI-assisted code/docs/tests. External reviewer participation is recorded only after it happens. No reviewer message, approval, main merge, deployment or final acceptance was fabricated by preparing this packet.
