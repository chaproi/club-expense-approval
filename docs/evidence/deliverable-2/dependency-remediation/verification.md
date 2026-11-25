# Prisma config security remediation verification

25 November 2026 (Asia/Bangkok). [Issue #44](https://github.com/chaproi/club-expense-approval/issues/44). The [plan](plan.md) was committed at [`45f7046`](https://github.com/chaproi/club-expense-approval/commit/45f7046f754cf3eda8adb7c1ab0b1f3d3174a396) before package changes. Clean dependency candidate [`a6c93ab`](https://github.com/chaproi/club-expense-approval/commit/a6c93abd350b9926cb51ff287339cd4d02ff2013) follows staging 7ab41689df7961ec8bab279cdd98d1afddf7a912. This evidence commit records execution on that candidate.

## Scope and audit

Prisma and Client remain 6.19.3. Only @prisma/config@6.19.3 receives overrides for deepmerge-ts 8.0.0 and effect 3.22.1. npm generated the lockfile. Only those two resolved package entries changed, including registry integrity/metadata. Application, schema, migrations, tests, Dockerfile and workflow configuration stayed byte-identical to staging.

The original full and omit=dev audits each reported four High entries from GHSA-ggr8-5vv4-36mx and GHSA-7589-6fvf-x4pw and their ancestors. After the scoped overrides, both audits returned exit 0 and zero findings at all severities. The four complete audit JSON files and explain/ls outputs are beside this report. These are dependency before/after results.

| Dependency command | Exit | Wall time |
|---|---:|---:|
| `npm.cmd ci` | 0 | 13.344 s |
| `npm.cmd audit --json` | 1 | 2.044 s |
| `npm.cmd audit --omit=dev --json` | 1 | 2.129 s |
| `npm.cmd install --package-lock-only --ignore-scripts` | 0 | 1.539 s |
| `npm.cmd ci` | 0 | 12.649 s |
| `npm.cmd explain deepmerge-ts effect @prisma/config prisma --json` | 0 | 1.252 s |
| `npm.cmd ls prisma @prisma/client @prisma/config deepmerge-ts effect --all --json` | 0 | 1.211 s |
| `npm.cmd exec -- prisma validate` | 0 | 2.279 s |
| `npm.cmd exec -- prisma generate` | 0 | 2.497 s |
| `npm.cmd audit --json` | 0 | 1.502 s |
| `npm.cmd audit --omit=dev --json` | 0 | 1.451 s |

Prisma validate used a non-serving syntactically valid datasource solely for schema validation. No database access is claimed for validate. The subsequent regression and image migration used separately verified live targets.

## Clean candidate confirmation

| Phase | Exit | Wall time |
|---|---:|---:|
| 02-tsc | 0 | 2.998 s |
| 04-migrate | 0 | 1.887 s |
| 05-build | 0 | 5.320 s |
| 05-unit-api | 0 | 3.514 s |
| 05-browser | 0 | 27.943 s |
| 06-docker-build | 0 | 31.866 s |
| 06-image-versions | 0 | 0.751 s |
| 06-image-real-migrate | 0 | 1.355 s |
| 06-image-real-seed | 0 | 0.983 s |

- Unit/API regression collected/executed/passed 47 tests, failed 0, skipped 0, cancelled 0.
- The complete two-file browser suite collected/executed/passed 19 tests, failed 0, skipped 0. Playwright used one Chromium worker and zero retries.
- Explicit TypeScript, production build and Docker build passed. The image contains Prisma/Client 6.19.3, deepmerge-ts 8.0.0 and effect 3.22.1.
- The existing image's actual npm run db:migrate applied all three committed migrations to a newly created empty database, after an image-side live identity/schema/zero-table check. The image's actual seed command created four disposable demo accounts.
- The app started from that image. HTTP root, login, current Requester, empty owned list, create and exact detail read passed (200/200/200/200/201/200). Logout returned 204 and the revoked session returned 401.

The Docker app and migration job used an owned network and the same image. No Cloud Run operation occurred. Command outputs and exact observations are in [verification.log](verification.log) and [results.json](results.json).

## Populated baseline upgrade on the new candidate

The revised [upgrade harness](verify-populated-upgrade.cjs) requires UPGRADE_CANDIDATE to be a full SHA, verifies the checked-out commit and requires the exact version-scoped overrides. It retained the existing [assertion worker](populated-upgrade-worker.mjs) and baseline 43aa8d7472aa8852654d0d634d7239c3765c5869. The candidate argument for this execution was `a6c93abd350b9926cb51ff287339cd4d02ff2013`.

PASS on `a6c93abd350b9926cb51ff287339cd4d02ff2013`. The baseline created three legacy requests and five events through real authenticated API operations. Immediately after the candidate migrations, full user/session and request/event snapshots matched, except for the expected zero revisions on all three requests. This preservation check preceded candidate authentication/business writes.

The legacy SUBMITTED request then completed Return/Edit/Resubmit/Approve with its original ID, assignment and createdAt. Four new events and revisions were verified, yielding three requests and nine events. Every earlier event and both legacy terminal records remained exact. Anonymous, wrong-role, foreign-owner and terminal denials preserved domain state. Owner/Reviewer lists/details/history matched after a new Express app/listener and Prisma client were constructed against the same upgraded database. This is app/client reconstruction within the worker, without a container or browser restart claim.

The prior [063d80d report](https://github.com/chaproi/club-expense-approval/blob/063d80ddd0a73c62b5c0c600695af77f716da53d/docs/evidence/deliverable-2/populated-upgrade/evidence.md) remains historical evidence on 7ab4168. It is not substituted for this candidate's execution.

To repeat the upgrade check, fetch both pinned commits into the source checkout and set a fresh external output directory. Set `UPGRADE_CANDIDATE` and `F05_SHA` to the selected full candidate SHA, `F05_OUT` to that output directory and `UPGRADE_WORKER` to the absolute path of the published worker. Run `node docs/evidence/deliverable-2/dependency-remediation/verify-populated-upgrade.cjs`. The harness fetches and verifies the candidate before writing fixtures.

## Environment, cleanup and limitations

Windows NT 10.0.26200.0, Node v24.14.0, npm 11.9.0, Prisma 6.19.3, Playwright 1.62.1, Chromium 151.0.7922.34, Docker client/server 29.9.3 29.9.3 and PostgreSQL 17.12 (Debian 17.12-1.pgdg12+1). Browser output included NO_COLOR/FORCE_COLOR warnings. PostgreSQL readiness initially returned 2 during startup and then 0. All install, assertion and build commands completed; no test skips, timeout/configuration changes or assertion changes were made.

Regression fixture counts independently returned zero before database disposal. After image shutdown, the image database had zero remaining connections. Upgrade cleanup independently found zero database client backends, including idle transactions. Owned containers, networks, volumes, image, private snapshots and temporary execution checkouts were removed. Original containers/environment and checkout states were preserved. Historical screenshots stayed untouched, while two generated inherited screenshots in the temporary checkout were removed.

deepmerge-ts 8 is still a major override outside Prisma's upstream exact pin. The earlier assessment and plan retain its configuration/Map compatibility limits and the upstream-removal criteria. This candidate passed the tested application and migration paths. Independent review, integration and release/deployment acceptance remain pending. No production risk acceptance is inferred.
