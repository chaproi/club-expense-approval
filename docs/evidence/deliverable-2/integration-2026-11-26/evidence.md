# Integrated Deliverable 2 verification

26 November 2026, Asia/Bangkok. Actual execution tested clean staging `717536287117118d508e08d6cc68764a5df537c7` after PRs #43 and #45 merged. The following documentation commit records this execution. This is local integration evidence.

## Reviewed integration

| PR | Reviewed head | Approval | Merge SHA | Merge timestamp UTC |
|---|---|---|---|---|
| [#43](https://github.com/chaproi/club-expense-approval/pull/43) | `f487956511a79951656a2392bec002cde555ec67` | [thananun-7203 approval](https://github.com/chaproi/club-expense-approval/pull/43#pullrequestreview-6059594795) | `7ab41689df7961ec8bab279cdd98d1afddf7a912` | 2026-11-25T14:34:34Z |
| [#45](https://github.com/chaproi/club-expense-approval/pull/45) | `d385c231c315154cc496a2b781f18d822e682058` | [thananun-7203 approval](https://github.com/chaproi/club-expense-approval/pull/45#pullrequestreview-6061894648) | `717536287117118d508e08d6cc68764a5df537c7` | 2026-11-25T17:19:50Z |

Git byte comparison verified that client, server, Prisma schema/migrations, package manifest/lockfile, Dockerfile/.dockerignore, workflows and Playwright configuration at `717536287117118d508e08d6cc68764a5df537c7` match verified dependency candidate `a6c93abd350b9926cb51ff287339cd4d02ff2013`. Both reviewed heads are ancestors of integrated staging. No commits followed the expected #45 merge at the time of fetching.

PR #43's earlier requested-changes review and BF-01 remain preserved. Its approval applies to the corrected f487956 head. PR #45's approval is scoped to the dependency remedy and its documented override limitations.

## Actual checks

| Command | Exit | Wall time |
|---|---:|---:|
| `npm.cmd ci` | 0 | 20.539 s |
| `npm.cmd exec -- tsc --noEmit` | 0 | 3.768 s |
| `npm.cmd exec -- playwright install chromium` | 0 | 1.767 s |
| `npm.cmd audit --json` | 0 | 1.572 s |
| `npm.cmd audit --omit=dev --json` | 0 | 1.478 s |
| `npm.cmd run db:migrate` | 0 | 2.189 s |
| `npm.cmd test` | 0 | 3.631 s |
| `npm.cmd run build` | 0 | 5.029 s |
| `npm.cmd run test:e2e -- --reporter=list,json` | 0 | 28.676 s |
| `docker.exe --context desktop-linux build -t club-expense-approval:d2-integration-2530998cb964 .` | 0 | 14.100 s |

Unit/API collected/executed/passed 47, failed 0, skipped 0, cancelled 0. Two browser files collected/executed/passed 19, failed 0, skipped 0. The browser includes 16 draft-recovery/BF-01 cases and three inherited journeys. The existing one-worker, zero-retry configuration was retained. Both full and omit=dev audits reported zero findings. TypeScript, production build and Docker build passed.

Runtime was Windows NT 10.0.26200.0, Node v24.14.0, npm 11.9.0, Chromium 151.0.7922.34, Docker client/server 29.9.3 29.9.3 and PostgreSQL 17.12 (Debian 17.12-1.pgdg12+1). The fresh npm ci generated Prisma Client 6.19.3. Browser output includes NO_COLOR/FORCE_COLOR warnings. The initial PostgreSQL readiness probe returned 2 during startup and then 0. There was one execution of each requested test/build/audit command.

The live target check verified an owned loopback PostgreSQL database/role, public schema and zero tables before migrations, distinct from configured existing targets. Independent counts found zero fixture users, sessions, requests and history after tests. A separate PostgreSQL query found zero remaining client backends including idle transactions. The owned database container/volume, image and temporary checkout were removed. The original branch, environment file bytes and container inventory remained intact. Two inherited generated screenshots were removed only from the temporary clone, with historical tracked artifacts preserved.

## Provenance and remaining limits

[BF-01 RED and GREEN](https://github.com/chaproi/club-expense-approval/blob/f487956511a79951656a2392bec002cde555ec67/docs/evidence/deliverable-2/f05-draft-recovery-bf01.md) records tests-first correction of the clean-draft bug. [dependency verification](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md) records audit remediation, actual migration/seed and HTTP smoke from the image on a6c93ab. [populated upgrade at a6c93ab](https://github.com/chaproi/club-expense-approval/blob/d385c231c315154cc496a2b781f18d822e682058/docs/evidence/deliverable-2/dependency-remediation/verification.md#populated-baseline-upgrade-on-the-new-candidate) checks immediate exact data preservation/revision backfill, subsequent intentional legacy workflow, guards and app/client reconstruction. That populated upgrade was not rerun on the merge commit. Source/dependency/configuration equivalence was checked here, and the new integration commands above did execute on the merge SHA. The separate 063d80d populated-baseline rehearsal remains historical evidence at 7ab4168.

This batch ran Docker build. The prior image migration/HTTP smoke and populated upgrade retain their original candidate provenance. Independent source approvals and staging checks do not establish main release, deployment or independent acceptance of the deployed system. deepmerge-ts 8 remains an override outside upstream's exact pin, with removal criteria in the dependency plan. F-06 category totals, F-07 two-stage approval and F-08 filters remain planned Final work.

See [full results and review provenance](results.json), [command outputs](verification.log), [full audit](02-audit.json) and [production audit](02-audit-production.json).
