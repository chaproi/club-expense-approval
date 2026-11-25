# Populated Sprint 1 upgrade verification

25 November 2026 (Asia/Bangkok). This local rehearsal tested approved corrected Sprint 1 baseline `43aa8d7472aa8852654d0d634d7239c3765c5869` and Deliverable 2 candidate staging `7ab41689df7961ec8bab279cdd98d1afddf7a912`. The candidate matched fetched origin/staging/sprint-2 before execution and publication preparation. The original checkout stayed on fix/issue-42-f05-draft-recovery at `f487956511a79951656a2392bec002cde555ec67`, with its environment bytes and clean status preserved.

## Result

**PASS.** U2 completed all six candidate verification groups using real Express HTTP authentication, business endpoints and PostgreSQL. These are assertion scripts. No unit-runner case counts or browser execution are attributed to this rehearsal.

| Boundary | Expected | Observed |
|---|---|---|
| Sprint 1 population | Four synthetic actors, three real API-created requests in SUBMITTED/APPROVED/REJECTED, five valid events | Exact states, fields and history verified under baseline schema/client, without revision column |
| Immediately after migration | Retain all requests/events, IDs, assignments, fields and timestamps. Backfill all revisions to zero | Exact full request/event snapshots matched. Private user/session records also matched internally |
| Candidate reads and denials | Owner and assigned reviewer read all old data. Anonymous 401, foreign owner/unassigned reviewer 404, wrong-role edit 403. Both terminal records reject edit/resubmit/return with 409 | Every asserted response and safe code matched, full domain snapshots stayed unchanged |
| Intended subsequent workflow | Same legacy SUBMITTED ID goes Return, Edit, Resubmit, Approve with four revision increments and four new events | Same assignment/createdAt retained, updatedAt advanced, 5 to 9 total events. Every old event and terminal record retained exactly |
| Restart | Close listener, disconnect Prisma, construct new client/app/listener, log in and reread | Owner/reviewer readback matched exact final details/history and preserved domain |

The immediate migration comparison ran before candidate authentication or business writes. The later Return/Edit/Resubmit/Approve changes were intentional and checked separately. Restart here means constructing a new Express app/listener and Prisma client in the worker against the same database. Process, browser and Cloud Run restart coverage remains outside this rehearsal.

## Attempts and commands

U1 failed during checkout preparation, exit 128, with fatal: unable to read tree for the candidate SHA. Cloning the local feature branch had not transferred the fetched remote merge object. No database or fixtures existed. Cleanup preserved the original checkout and containers. The corrected harness explicitly fetches both pinned revisions from the source checkout into the temporary clones. U2 confirmed that concrete setup correction.

| U2 phase | Actual command | Exit | Wall time |
|---|---|---:|---:|
| 03-baseline-ci | `npm.cmd ci` | 0 | 15.801 s |
| 03-baseline-build | `npm.cmd run build` | 0 | 5.190 s |
| 03-candidate-ci | `npm.cmd ci` | 0 | 17.242 s |
| 03-candidate-build | `npm.cmd run build` | 0 | 5.942 s |
| 05-baseline-migrate | `npm.cmd run db:migrate` | 0 | 1.848 s |
| 05-baseline-fixtures | `node populated-upgrade-worker.mjs baseline` | 0 | 1.000 s |
| 06-candidate-migrate | `npm.cmd run db:migrate` | 0 | 2.472 s |
| 06-candidate-verification | `node populated-upgrade-worker.mjs candidate` | 0 | 1.099 s |
| 06-migrations | `docker.exe --context desktop-linux exec d05834aed379fe34a08cf5f1410b30408fcfff55cb832b72e0a537ec0c539fec psql -U test_upgrade_c3f77755a8f4 -d test_upgrade_c3f77755a8f4 -At -c select migration_name from "_prisma_migrations" where finished_at is not null order by migration_name;` | 0 | 0.213 s |

Both checkouts used their own committed lockfiles, generated Prisma Client and production build. The baseline applied only auth-foundation and expense-request migrations. Candidate then applied the additive return/resubmit migration. All three recorded migrations finished. No seed or shared-database reset was used.

Windows NT 10.0.26200.0, Node v24.14.0, npm 11.9.0, Prisma 6.19.3, Docker client/server 29.9.3 and PostgreSQL 17.12 (Debian 17.12-1.pgdg12+1). The installs reported four high-severity dependency findings. Dependency-audit disposition remains a separate release gate.

See [actual command metadata, expected/observed outcomes and sanitized output excerpts](results.json). Full redacted logs remain outside the repository. The private snapshot was used only for internal equality checks and deleted with its owned temporary directory.

## Reproduction and isolation

Use Windows, Node 24, Git, npm and Docker Desktop's desktop-linux context. Fetch the pinned revisions into the source repository. Run from that repository root and choose a new empty output directory outside it.

`git fetch origin main staging/sprint-2`

`$env:F05_OUT = Join-Path $env:TEMP ('d2-upgrade-results-' + [guid]::NewGuid().ToString('N'))`

`$env:F05_SHA = '7ab41689df7961ec8bab279cdd98d1afddf7a912'`

`$env:UPGRADE_WORKER = (Resolve-Path docs/evidence/deliverable-2/populated-upgrade/populated-upgrade-worker.mjs).Path`

`node docs/evidence/deliverable-2/populated-upgrade/verify-populated-upgrade.cjs`

The runner creates two owned temporary checkouts and a loopback-only PostgreSQL container with random private credentials. Before migration it checks expected database, owner, public schema and zero tables, and compares the target against the original private configuration. The baseline writer stops and disconnects before candidate migrations. App listeners use OS-assigned ephemeral loopback ports.

The published scripts are the exact bytes used in U2. Private user/session comparisons use assertions that report only a failure label. Credentials, private snapshots and connection values are excluded from published artifacts.

## Cleanup and remaining gates

A separate PostgreSQL check found zero remaining client backends for the disposable database, including idle transactions. The owned container/volume, snapshots and temporary checkouts were removed. Original containers, environment bytes, branch and working-tree status stayed unchanged. Before disposal there were 4 fixture users, 3 requests and 9 events. Sessions were removed with the owned database.

This establishes the selected populated-baseline migration and API workflow compatibility. Independent review, release integration, dependency-audit disposition and deployment acceptance remain pending.
