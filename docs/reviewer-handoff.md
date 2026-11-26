# Deliverable 2 — independent reviewer handoff

## Current released checkpoint — 26 November 2026

PRs #39/#40/#41/#43/#45/#46/#47 have actual independent source reviews and staging merges. Release [PR #48](https://github.com/chaproi/club-expense-approval/pull/48) was approved on ecab746 and merged to main **cc6b04c8e98191be591a3b755d25988148523909**. [Deployment and owner-directed checks](evidence/deliverable-2/postdeploy-2026-11-26/evidence.md) record successful main CI (47/47 API, 19/19 browser, build/Docker), migration s981b09c9-migrate-hbkpk, revision s981b09c9-00008-pch and log-reported 100% traffic, then 8 public + 10 authenticated live checks PASS. The earlier selector failure is retained.

The [current D2 completion/checklist](sprints/d2-completion-2026-11-26.md) and [report source packet](reports/deliverable-2/README.md) supersede earlier pending release/deploy statements. Technical delivery is recorded; owner final acceptance/submission is not. **Do not add a new mandatory external peer acceptance gate for D2.** [Original Lab 6 UAT/retest](labs/lab-06/retest-status-2026-11-26.md) remains version-specific and separate. Direct-cloud verification and exact pre-release shared snapshots remain limited as disclosed. F-06 totals/F-07/F-08 are planned.

Everything below is retained historical handoff content. Completed review/release tasks or the old external-acceptance assumption below are not current outstanding D2 gates.

Updated 26 Nov 2026 / chaproi. **PRs #43 and #45 are independently source-approved and merged into Sprint 2 staging. Integration checks passed at 7175362. Main release and deployed acceptance remain pending.** Do not merge evidence-only PR17.

The earlier 24–25 Nov handoff below described #42 as ready for source review. Its then-pending review/integration instructions are retained as historical context. The current checkpoint follows.

## Current integration checkpoint, 26 November 2026

PR #43 was approved on f487956 by thananun-7203 and merged at 7ab4168. PR #45 was approved on d385c23 by the same independent reviewer and merged at 7175362. The [integration record](evidence/deliverable-2/integration-2026-11-26/evidence.md) links both actual approvals and reports fresh 47/47 unit/API, 19/19 browser, TypeScript/build, Docker and both audits PASS at `717536287117118d508e08d6cc68764a5df537c7`. Git byte comparison verified that client, server, Prisma schema/migrations, package manifest/lockfile, Dockerfile/.dockerignore, workflows and Playwright configuration at `717536287117118d508e08d6cc68764a5df537c7` match verified dependency candidate `a6c93abd350b9926cb51ff287339cd4d02ff2013`. Both reviewed heads are ancestors of integrated staging. No commits followed the expected #45 merge at the time of fetching.

[BF-01 RED and GREEN](https://github.com/chaproi/club-expense-approval/blob/f487956511a79951656a2392bec002cde555ec67/docs/evidence/deliverable-2/f05-draft-recovery-bf01.md), [dependency verification](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md) and [populated upgrade at a6c93ab](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md#populated-baseline-upgrade-on-the-new-candidate) provide correction and candidate-level evidence. Review this documentation and completion checklist before preparing the staging-to-main release. Main approval, deployment, post-deploy verification and Deliverable 2 acceptance remain pending.

The sections below retain the earlier handoff and its then-pending gates. This current checkpoint supersedes their review/integration status for #43/#45.

## Review and integration order (historical checkpoint)

| Order | PR / issue | Scope | Current evidence / gate |
|---|---|---|---|
| 1 | [PR39](https://github.com/chaproi/club-expense-approval/pull/39) / #34 | Complete S2/S3 contracts, full SRS/SDS/inventory/matrix and CI targets | Head `c7539ee` passed CI45235767973 and merged into Sprint 2 staging at [`c6e31a1`](https://github.com/chaproi/club-expense-approval/commit/c6e31a1160ce8f263963e7087b9c9ae516f7d47e) |
| 2 | [PR40](https://github.com/chaproi/club-expense-approval/pull/40) / #35/#36/#37 | Additive schema + revision-safe return/edit/resubmit + assigned DB counts | Head `feea765` passed CI45236047280 (47 unit/API, 2 original browser, build/Docker) and merged into Sprint 2 staging at [`77a8fee`](https://github.com/chaproi/club-expense-approval/commit/77a8fee46b0e5b399ffd118b062ea8078bdb25f2) |
| 3 | [PR41](https://github.com/chaproi/club-expense-approval/pull/41) / #35/#36/#37 | Complete new UI and combined browser loop, explicit self/overflow verification, retained evidence and current docs | UI source `830346b` passed CI45237202381 (47 unit/API, 3 browser, build/Docker). Final head [`8f271e7`](https://github.com/chaproi/club-expense-approval/commit/8f271e7297c4cbaa094b9daa8556f58a28ef487c) passed [verify run 45238569490](https://github.com/chaproi/club-expense-approval/actions/runs/45238569490/job/137916738045) and merged into Sprint 2 staging at [`ed06b11`](https://github.com/chaproi/club-expense-approval/commit/ed06b112e8a61890b10daaf76ddbd9632f77c88c) |

PRs #39, #40 and #41 merged in order. The Issue #42 review compares the draft-recovery branch against that integrated staging base. Recheck the current base, head and required CI before approval, then verify the integrated candidate separately.

Review six areas with actual findings: (1) requirement/contract/AC scope and revisions, (2) state and stale-round rules, (3) transaction/migration/history retention, (4) role/ownership/self/Origin and private DTOs, (5) meaningful RED/GREEN, boundary/race/regression/browser evidence, (6) UI behavior, CI/deploy/readiness and remaining Final work. Record reviewer identity, reviewed SHA, findings/disposition and decision in GitHub. No author/AI self-approval counts as independent review.

## Evidence already available

- Contracts preceded implementation in c7539ee. RED test commit18795b7 and recorded output7ff574c:13 new tests fail on old behavior; no production fix in RED.
- GREEN API sourcefeea765:47/47 pass with real PostgreSQL; unchanged runtime assertions with one disclosed TypeScript const annotation. The historical missing-endpoint PATCH404 changed to valid SUBMITTED edit409 as specified before code.
- `docs/evidence/deliverable-2/migration-compatibility.json`:3 old request rows and3 old event rows exact after additive migration, new revision0. This used an isolated DB; the assessed Cloud SQL data was not reset/seeded.
- `hosted-ci-excerpts.md` and `hosted-45237202381/`: actual CI/browser output and two synthetic screenshots; original failed UI run retained in the evidence narrative, corrected label kept the same test assertion.
- `final-api-verification.log`:47/47 local, including explicit self-return and int32-exhaustion assertions. Local browser launch policy failures are retained separately and never counted as passes.
- Current full requirements/feature/AC/test mappings are in `docs/srs.md`, `docs/features.md`, `docs/system-sds.md`, `docs/traceability.md`; all five feature contracts are complete documents under `docs/contracts`.

## Issue #42 follow-up

- F-05 v1.1 contract [`cda5069`](https://github.com/chaproi/club-expense-approval/commit/cda506993dbab0b15af1bd70c96265b69117ef6a) preceded [RED A4](evidence/deliverable-2/f05-draft-recovery-lifecycle-red.md), which tested [`1667ec2`](https://github.com/chaproi/club-expense-approval/commit/1667ec2877ba926ad9ca902de50947c14037bf4a). The A4 evidence commit is [`0a006d3`](https://github.com/chaproi/club-expense-approval/commit/0a006d364ce0a73fb6877822faeb3818a985df7e).
- UI source [`ffefb2d`](https://github.com/chaproi/club-expense-approval/commit/ffefb2da0c812f5dee17309cefcfd3e01b30313e) passed 47/47 unit/API tests, 17/17 browser cases (14 draft-recovery and 3 inherited), TypeScript, production build and Docker build. [GREEN evidence](evidence/deliverable-2/f05-draft-recovery-green.md) was published in [`529a489`](https://github.com/chaproi/club-expense-approval/commit/529a4896e6c29a0cdf310a971bb709c6dd55f165). The [executed AC map](traceability.md#f-05-v11-executed-verification) identifies what each case proves.
- Review the real stale Save, latest-value and draft views, changed-field Restore and manual Save, GET-only retry, repeated conflict, and clearing on denied access or account change. Independent peer review, staging integration and deployment acceptance for this correction remain pending.

**BF-01 re-review.** The [request for changes](https://github.com/chaproi/club-expense-approval/pull/43#pullrequestreview-6052693657) applies to [`67050d6`](https://github.com/chaproi/club-expense-approval/commit/67050d629d45efa4677ca72eba0a362b1f698d35). The earlier [hosted CI](https://github.com/chaproi/club-expense-approval/actions/runs/45553875619/job/139001178059) passed on that head. The [BF-01 evidence](evidence/deliverable-2/f05-draft-recovery-bf01.md) records both behavioral RED cases and clean source [`cb05d62`](https://github.com/chaproi/club-expense-approval/commit/cb05d627c0bb1cdaf76f636c17f3f2458c81b71f) with 47/47 unit/API and 19/19 browser cases passing. Review that returning a draft to saved values clears it and that Resubmit leaves a clean SUBMITTED detail. Independent re-review, staging integration and deployment acceptance remain pending. Dependency-audit disposition and upgrade verification with populated Sprint 1 data remain separate release gates.

## Reviewer demos / remaining checks

1. Reviewer returns an assigned SUBMITTED request with reason; owner reads same ID/reason/history. Other users and invalid reasons cannot change it.
2. Owner edits a RETURNED request; unsaved changes disable Resubmit, Save persists fields, Resubmit uses new revision, reviewer approves the new round, owner reads all five events. Old/replayed commands409 without extra event.
3. Reviewer summary uses assigned current DB records, with correct zeros and counts after each transition. Requester cannot call/read summary. F-06 sums and two-stage/filter features are still planned.
4. Manually inspect new loading/empty/error/pending/conflict UI states. Hosted successful journeys are not evidence for every transient UI condition. Recheck exact version and integrated access/persistence after release.

## Release gate after independent peer approval

- Complete independent review and integration verification of Issue #42. Resolve the [dependency audit and populated Sprint 1 database upgrade gates](evidence/deliverable-2/f05-draft-recovery-triage.md#separate-release-gates). Record a reviewed Sprint 2 release identity before any later Sprint 3 release. F-06 remains count-only at this checkpoint.
- Open the reviewed staging→main release PR, obtain real peer approval and green required checks; record immutable merged main SHA. No direct unreviewed merge/deploy is claimed here.
- Existing main deploy workflow runs reusable CI, builds/pushes image, executes required migration job, then deploys Cloud Run. Record actual run, migration success, revision, digest, traffic and serving version; preserve existing data.
- Post-deploy: health/login/session/logout, old approve/reject, return/edit/resubmit, summary scope/counts, denied owner/role/Origin and old-data readback. Capture expected/actual with time and exact release. Do not use isolated synthetic migration results as proof of the shared deployed DB.
- Finalize the one self-contained PDF only after inserting review/release/deployed evidence. Include Parts A–E, all current docs/contracts, two meaningful test excerpts, two Issue/PR chains, selected demos, output and remaining plan. D2 due29Nov23:59 Bangkok; target submit20:00.

## Board and remaining dependencies

[Project board](https://github.com/users/chaproi/projects/4) verified: auto-add contains Issues34–38 and PR39–41 in Backlog. Current columns are Backlog/Specified/Started/PRReview/Fixing/Done. Public signed-out view cannot move cards; update using the owner's signed-in session. Source-complete cards belong in review, never Done before their release/acceptance gate. No board movement is claimed.

F-06 sums target4Dec; F-07 two-stage approval target2Dec; F-08 status filters target3Dec; integration/hardening5–7Dec; independent UAT8–10Dec; final video/report/release11–12Dec; final submission13Dec. Both two-stage approval and filters remain required. Lab7 approved maintenance change remains a separate instructor/TA approval dependency. Existing cross-tab logout/UTF-16 title-count observations remain disclosed Low limitations.

Contribution: chaproi directs and inspects AI-assisted code/docs/tests. External reviewer participation is recorded only after it happens. No reviewer message, approval, main merge, deployment or final acceptance was fabricated by preparing this packet.
