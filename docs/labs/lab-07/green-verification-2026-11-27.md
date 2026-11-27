# Lab 7 category limits — local GREEN verification, 27 November 2026

## Scope, governance and source provenance

[Issue #49](https://github.com/chaproi/club-expense-approval/issues/49), branch **feat/lab7-category-limits**, from accepted staging **453528073038a3122ecd7abb0adac7bf09a1dc41**. Main/deployed release remains **cc6b04c8e98191be591a3b755d25988148523909**. Fresh fetch at the start confirmed the published RED head17aba6f, staging4535280 and maincc6b04c; there was no intervening production drift or pending local change. No applicable AGENTS.md was found. README, reviewer handoff, actual implementation/tests, accepted AC/STS and the full submitted PR50 review were read before editing. Two initial reads guessed a nonexistent App.tsx path; the actual file was located with rg before any edit.

The [acceptance record](contract-acceptance-2026-11-27.md) retains thananun-7203's substantive approval of c7f1c88 on2026-11-27T06:11:30Z and merge4535280 on07:05:24Z. Instructor/TA approval is **Not required under updated instructor announcement**, not Approved. Independent implementation review, integration, main release, new-policy deployment and acceptance remain **Pending**. No PR, Issue update/closure, merge or deployment was performed.

| Increment | Actual SHA / purpose |
|---|---|
| Prior tests-first RED | [f08672d](https://github.com/chaproi/club-expense-approval/commit/f08672dda573907cba0ef686c5d80e74f81a53e2); [RED evidence17aba6f](https://github.com/chaproi/club-expense-approval/commit/17aba6fa69a6c6afe3c864fc33fa2e50b660afa3):116 executions across focused commands,87 pass/29 semantic fail/zero skip, not116 unique new tests |
| Production/migration candidate, committed before verification | **[ec10dd44140ee41f41826763c1500097d9b626e9](https://github.com/chaproi/club-expense-approval/commit/ec10dd44140ee41f41826763c1500097d9b626e9)**: server parser/messages, both forms, one new SQL migration |
| Supplementary verification, not retroactive RED | **[a0d1e9d57058b6377c44cf8c3e8a0e9a965d396d](https://github.com/chaproi/club-expense-approval/commit/a0d1e9d57058b6377c44cf8c3e8a0e9a965d396d)**:54 SQL/high-value API cases plus the populated-upgrade worker |
| Image HTTP verification helper | **[d406cb88eb0d8c3009350cd6d8db370c138d6be7](https://github.com/chaproi/club-expense-approval/commit/d406cb88eb0d8c3009350cd6d8db370c138d6be7)**: supplementary documentation helper only, no runtime/source change |

Focused types/unit/API/browser ran at clean ec10dd4. After adding supplementary verification, types/additional/full API/build/full browser/Docker/populated checks ran at clean a0d1e9d. The image HTTP helper ran at clean d406cb8 against the image built at a0d1e9d; their application/migration bytes are identical. This later documentation/evidence increment is not a new application execution. The original branch/proposal, old failures/RED artifacts and completed D2 packet remain untouched.

## Exact implementation

- Server validates known category and numeric integer amount together: ACTIVITY1–150000, EQUIPMENT1–120000, TRAVEL1–100000. Unknown/missing/prototype property categories have no fallback. Existing parser interfaces, title/body validation, API shapes/codes, ownership/role/Origin/session/assignment/status/revision predicates and atomic history remain unchanged. Known-category400 feedback names its actual whole-baht range; unsupported categories request a supported selection.
- Both amount controls retain names, number/min1/step1/required, with category-dependent max and linked readable feedback. Create category/amount are controlled; category changes retain the amount, and successful explicit creation resets both. Invalid Save/Submit is prevented both natively and by handlers. Dirty Resubmit remains disabled.
- The existing draft capture/reconciliation/Restore/Discard/retry/lifecycle/BF-01 functions are unchanged. A restored amount over newer TRAVEL remains visible, invalid and explained until the user deliberately corrects the pair. No category selection, validation or recovery control sends a mutation.
- New migration **20261127000000_category_amount_limits** uses BEGIN/COMMIT, an exclusive table lock, verification of the validated inherited named CHECK's expected definition, and replacement with explicit category branches. No schema-model/type/enum/index/row/event rewrite; all three applied migration files are unchanged. PostgreSQL INTEGER is retained.
- Restoring the old uniform CHECK or old application over larger saved values is unsafe/incompatible. Never clamp/delete data to make rollback pass. Use reviewed forward correction or a separately reviewed narrowing/data policy. No destructive down-migration was run.

## Runtime and isolated targets

Host: Windows10.0.26200, Node24.14.0, npm11.9.0, TypeScript5.9.3, Prisma CLI/generated Client6.19.3, Playwright1.62.1 and real Chromium (installed manifest151.0.7922.34/revision1234). Browser runs used normal project setup, one worker and zero retries; no mocked policy/database responses, timeout/retry/concurrency changes or existing assertion edits.

Docker Desktop Linux engine29.9.3; guarded PostgreSQL17.12 (Debian17.12-1.pgdg12+1). The actual built image reported **Node24.22.3**, Prisma CLI/Client6.19.3; do not relabel host runtime as image runtime. The unchanged Node24 Dockerfile resolved its existing base image normally.

Three owned targets were used: (1) a fresh disposable container/database/public schema; (2) a separate disposable container/database/public schema first migrated/populated by actual4535280; (3) a separately owned, initially empty image schema in the first disposable database. Each database used a random role/name, private password and ephemeral loopback host port. Before migration/fixtures, live current database/user/schema and empty-table identity matched the owned target; helpers repeat the live guard before writes. The image schema was separately checked absent, created, then checked empty before image migration/seed. A task-owned Docker network provided same-owned-database image access; HTTP was bound to an ephemeral localhost port matching APP_ORIGIN.

No operational/shared Cloud SQL was read, migrated, seeded or reset. Existing .env/.env.compose files were never copied or changed. Private URLs/seed secrets were passed only via child environments or an external owned env file, then removed. The image seed ran only in the newly created owned schema. Full [candidate runtime metadata](evidence/green-2026-11-27/candidate/runtime.json), [populated runtime](evidence/green-2026-11-27/populated/runtime.json) and [image runtime](evidence/green-2026-11-27/image/runtime.json) retain actual UTC starts, exits/signals/spawn errors and wall timings. All application commands ran sequentially without competing repository workloads.

## Executed commands and counts

All commands below ran from the candidate repository root except explicitly noted baseline/image commands. UTC dates are27November2026; Bangkok is UTC+7. Command wall timings include startup. Source was clean at each recorded application run; the supplementary helper commit changes verification only.

| Attempt / exact command | Tested revision | Collected / executed | Pass / fail / skip / cancel | Exit | Wall duration |
|---|---|---|---|---|---|
| types-1: `npm.cmd exec -- tsc --noEmit` | ec10dd4 | N/A | N/A |0 |3.361s |
| unit-1: `node --import tsx --test server/test/expense-input.test.ts` | ec10dd4 |34 /34 |34 /0 /0 /0 |0 |0.289s |
| api-1: `node --import tsx --test server/test/category-limits.test.ts` | ec10dd4 |51 /51 |51 /0 /0 /0 |0 |2.719s |
| browser-1: `npm.cmd run test:e2e -- client/test/category-limits.spec.ts --reporter=list,json` | ec10dd4 |4 /4 |4 /0 /0 /0 |0 |16.056s |
| types-2: `npm.cmd exec -- tsc --noEmit` (new supplementary TS files) | a0d1e9d | N/A | N/A |0 |3.538s |
| additional-1: `node --import tsx --test server/test/category-limits-additional.test.ts` | a0d1e9d |54 /54 |54 /0 /0 /0 |0 |3.385s |
| full-1: `npm.cmd test` | a0d1e9d |184 /184 |184 /0 /0 /0 |0 |5.937s |
| build-1: `npm.cmd run build` | a0d1e9d | N/A | N/A |0 |5.572s |
| fullbrowser-1: `npm.cmd run test:e2e -- --reporter=list,json` | a0d1e9d |23 /23 |23 /0 /0 /0 |0 |63.999s |
| docker-1: `docker build -t club-expense-approval:lab7-green-6043eabea85f58f6 .` (existing desktop-linux context) | a0d1e9d | N/A | N/A |0 |25.838s |

The focused89 changed-behavior executions (34+51+4) now all pass, including the29 earlier semantic RED failures. There are **350 successful test executions across the six listed test commands**, including repetitions inherent in focused versus complete suites, not350 unique new tests. Complete unit/API discovery:8 test files/184 tests; complete browser discovery:3 files/23 tests (19 inherited+4 Lab7). There were zero test failures, skips, cancellations or flaky browser cases in this GREEN stage. No assertion/test was skipped or weakened. Two type runs were justified by the new supplementary TS files; no unchanged passing suite was repeated merely to refresh a result.

The complete suites include unchanged authentication, API decisions/workflows, concurrency, access/Origin, stale revisions, draft lifecycle, GET-only retry, transport failures and both BF-01 cases. TypeScript and Vite production compilation also ran through normal browser/Docker setup; these nested setup commands are not separately counted as new test suites. Full npm test excludes nothing.

Original output: [full API](evidence/green-2026-11-27/candidate/full-1.log), [full browser](evidence/green-2026-11-27/candidate/fullbrowser-1.log), [Playwright JSON](evidence/green-2026-11-27/candidate/fullbrowser-1-playwright.json), [build](evidence/green-2026-11-27/candidate/build-1.log), [Docker build](evidence/green-2026-11-27/candidate/docker-1.log). [Results JSON](evidence/green-2026-11-27/results.json) independently reconciles actual summaries; it does not replace executed assertions.

## Fresh and populated migration evidence

Fresh installation applied the complete four-migration chain successfully (`npm.cmd run db:migrate`,exit0,1.891s), and the actual validated CHECK contains each category/ceiling. Direct PostgreSQL tests use valid prerequisite rows and transaction/savepoint rollback; no future-file-existence assertion substitutes for enforcement. The same frozen original51API/SQL tests now execute successful new-range readback and the previously unreached lower-cap category-only rejections.

The supplementary54 cases add actual SQL INSERT and amount-only UPDATE min/max/max+1/100000/cross-pair probes, independent category-only switches (125000/110000/120000/100000), maximum-value access/state/stale controls, genuine concurrent same-revision edit/resubmit with exactly one200/one409, revoked-session denial and truthful category-range feedback. Expected matrices remain literal and independent of production constants. Invalid/denied/probe writes compare exact authoritative request/event state.

For the populated rehearsal, a new detached checkout of **actual4535280** installed its unchanged lockfile (`npm.cmd ci`,exit0,15.897s); its original three migrations ran against a different guarded empty database (exit0,1.830s). The candidate's supplementary worker invoked the old source's actual Express factory, normal authentication and business HTTP endpoints to create **24 requests/42 events**: all3 categories,1/100000 boundaries, each SUBMITTED/RETURNED/APPROVED/REJECTED. Only synthetic accounts were provisioned directly. Complete private auth/request/event snapshots were retained outside Git; writers/listener/Prisma were quiesced before migration.

| Operation | Actual safe command / target | Exit | Wall duration / outcome |
|---|---|---|---|
| Old fixture | `node --import tsx <candidate>/server/test/lab7-upgrade-worker.ts baseline <4535280 checkout>` |0 |1.958s;24 rows/42 events, original CHECK and owner/assigned readback |
| Candidate migration | `npm.cmd run db:migrate`, candidate cwd/private populated target |0 |1.974s; one new migration |
| First post-migration comparison and workflows | `node --import tsx server/test/lab7-upgrade-worker.ts candidate <candidate checkout>` |0 |2.562s; immediate preservation exact, then intentional workflow changes |

Immediately after migration and before new auth/workflow writes, **all requests/events, IDs, assignment, fields, timestamps, revisions and private User/Session snapshots matched exactly**. Existing3 applied checksums were unchanged; total migrations became4. Old file bytes also match4535280. [Actual baseline output](evidence/green-2026-11-27/populated/oldfixture-1.log), [migration output](evidence/green-2026-11-27/populated/upgrade-1.log), [candidate output](evidence/green-2026-11-27/populated/verifyupgrade-1.log) and [structured outcome](evidence/green-2026-11-27/populated/verifyupgrade-report.json).

Only after preservation was proven, all6 legacy SUBMITTED records traversed Return→category maximum Save→Resubmit→Approve with the same IDs/assignment/createdAt and old history prefix. Expected final state: **24 requests/66 events**, assigned counts **0 SUBMITTED/6 RETURNED/12 APPROVED/6 REJECTED**, unassigned Reviewer zeros. All12 original terminal records remained read-only and exact; the6 original RETURNED rows also remained unchanged. High-value auth/ownership/Origin/stale/invalid denials left domain state exact. A new listener/Prisma connection and new HTTP reads preserved final records/history/counts after restart. This is API/client readback, not a browser-reload or deployed-data preservation claim.

## Actual image migration and HTTP workflow

Image **sha256:5ffe6c91e841a0656c9d0a3b403f78bff5335943d09e3f3ff6bc3722049a1f0d**, built from a0d1e9d. [Actual image files/versions](evidence/green-2026-11-27/image/09-image-files.log) record all4 migration files and SHA256 values inside the image, not merely host presence. Same Node24 architecture, unchanged Prisma6.19.3 packages/Dockerfile/dependencies.

- `docker run --rm --network <owned> --env-file <private> <candidate> npm run db:migrate`: **exit0,1.821s**, actual fresh4 migrations; database query confirms4 finished rows.
- Image `npm run db:seed`: **exit0,1.269s**, creates4 synthetic local accounts in the initially empty owned schema.
- Image's existing `npm start` serves root **HTTP200**. `node docs/labs/lab-07/verification/image-workflow.cjs`: **exit0,0.922s**, actual image/HTTP/PostgreSQL, not --help or mocked business results.
- All3 category maxima create successfully; max+1 rejected with unchanged state. Return→Save→Resubmit→Approve produces exactly **3 requests/15 events**, final revision4, exact amount/category and retained5-event history per request. Owner readback, assigned summary, foreign-owner/role/anonymous/Origin/stale denials and logout/revoked-cookie denial pass.
- App shutdown/removal, all schema rows/session clients zero, schema removal/absence and network detach/removal are independently checked. The uniquely verified image tag was removed after capture; no image/base/cache prune was used.

[Migration output](evidence/green-2026-11-27/image/10-migrate.log), [seed](evidence/green-2026-11-27/image/12-seed.log), [HTTP output](evidence/green-2026-11-27/image/14-workflow.log), [structured workflow](evidence/green-2026-11-27/image/workflow.json), [app logs](evidence/green-2026-11-27/image/16-app-logs.log), [cleanup](evidence/green-2026-11-27/image/owned-artifact-cleanup.json).

## AC/STS coverage and formerly unreached assertions

| Authority | Actual tests/assertions and current local result | Remaining qualification |
|---|---|---|
| AC-L7-01 / STS-L7-01/03/04 | Frozen unit34 and API51: category1/max/max+1 and independently specified125000 onlyACTIVITY;110000 ACTIVITY/EQUIPMENT only; exact persisted category/amount/revision/history/projection now reached. | Not operational deployment; no expected values derived from production. |
| AC-L7-02 / STS-L7-01/02 | Unit/API invalid amounts/types/categories/body/title controls; exact unchanged fields/updatedAt/revision/events; supplementary feedback/prototype-category denials pass. | API shapes/codes and inherited validation preserved. |
| AC-L7-03 / STS-L7-03/04 | Frozen browser4 pass: create ACTIVITY125000→EQUIPMENT/TRAVEL invalid→ACTIVITY valid; returned125000→EQUIPMENT invalid→110000 valid; linked category-specific descriptions, retained amounts, invalid no-write and explicit-submit reset. TRAVEL100000/100001 controls pass. | Focused representative UI sequences, not a new complete responsive/auditory audit or every browser matrix permutation. |
| AC-L7-04 / STS-L7-04/06/07 | Real two-session stale Save409 now reached; latest TRAVEL100000 separate from draft125000; Restore keeps TRAVEL125000 invalid without clamping/write; correction→manual Save uses newest revision→Resubmit; exact events/revisions. Full existing draft lifecycle/Retry/repeated-conflict/transport/BF-01 cases pass unchanged. | No draft reconciliation rewrite or fabricated409; existing controlled transport failures retain their original qualification. |
| AC-L7-05 / STS-L7-05/06 | Larger valid category maxima: anonymous/revoked401,wrong-role403,foreign404,Origin403,state/stale409, exact unchanged domain and safe projection; inherited missing-reviewer/self/overflow tests pass in full184. | Actor restrictions precede applicable state checks under existing contract; no broadened authorization. |
| AC-L7-06 / STS-L7-08/09 | Frozen SQL matrix/category-only chain now completes; supplementary INSERT/amount-only/category-only checks; fresh and populated migration preservation and old checksums; actual image migration. | Guard tested on the expected PostgreSQL17.12 definition. Other/pre-modified constraint definitions intentionally fail closed; negative drift guard and destructive rollback not executed. |
| AC-L7-07 / STS-L7-07/09 | Full184 unit/API and23 browser preserve Sprint1 decisions/history, Return/Edit/Resubmit/drafts/counts/access/races. Populated24/42→24/66 separates exact migration preservation from intentional workflows and restart/readback. | F-06 totals,F-07,F-08 remain Planned; no performance or new deployment acceptance claim. |
| AC-L7-08 / STS-L7-10 | Prior independent contract review verified; real RED-before-GREEN commits and all local results/provenance retained. | Independent implementation review/CI, staging/main integration, new-policy migration/deployment/live checks and final acceptance **Pending/Unexecuted**. Instructor/TA approval **Not required**. |

No current local behavioral assertion in these executed cases remains unreached. Future CI/release/live steps and additional platform/negative-drift qualification are not silently counted as passes.

## Attempts, warnings and cleanup

No application test, TypeScript, build, migration or image workflow command failed. No passing suite was repeated without a subsequent relevant verification-file change. The additional54 and populated/image checks were authored during GREEN verification, not relabelled as tests-first RED.

Retained non-semantic setup/operational events:

1. Fresh pg_isready exits2/2/0; populated exits2/1/0 before the respective identity guards/migrations. Readiness polling is setup, not a failed test.
2. The external populated runner initially rejected an unknown oldfixture selection because a command-map key was accidentally prefixed. No worker/fixture ran. The failure remains in its runtime record; correcting only that external key allowed one actual baseline/candidate execution. No assertion or application change was made for it.
3. Elevated Git ownership inspection during screenshot archiving was rejected under the different Windows account. Prior normal-account status established the two newly generated untracked paths; copies were hash-verified before removal from those old output locations. No tracked historical artifact changed.
4. Git's temporary-worktree removal hit **Filename too long**. After exact absolute ownership/non-reparse checks, native extended-length-path cleanup removed only that newly created baseline checkout. Git worktree registration and path absence were checked; no user checkout reset/clean occurred.
5. A tool-level parse rejection while authoring the documentation updater happened before any file write/execution; corrected quoting did not execute application tests. Test/run outputs themselves are not reconstructed.
6. Browser warnings: .env absent intentionally; NO_COLOR ignored with FORCE_COLOR. Docker npm ci warned that install scripts for @prisma/client,@prisma/engines,argon2,esbuild and prisma were not yet covered by allowScripts. No script approval/configuration/dependency change was made; explicit Prisma generation, build and actual image authentication/migration/seed succeeded. The warning remains disclosed for peer review. Git LF→CRLF working-copy notices were retained; published text is UTF-8/LF with trailing display whitespace removed. Original external outputs remain unchanged.

Independent final checks returned **0 users/0 sessions/0 requests/0 events/0 other client backends** on each owned database/schema, no4173 listener and zero worktree-owned Node/browser/command processes. Thus no retained test clients/idle transactions remained before deleting the owned targets. Both owned database containers/volumes, image app/schema/network/private env, private snapshot/settings, temporary baseline checkout and verified unique image tag were removed. All original3 containers and existing worktrees/environment files remained intact.

Two inherited E2E screenshots were newly generated at a0d1e9d and archived under this new evidence directory: [returned summary](evidence/green-2026-11-27/candidate/return-summary.png) and [final history](evidence/green-2026-11-27/candidate/resubmitted-final-history.png). They were visually inspected for synthetic/non-secret content; they show inherited ordinary workflow states, not new maximum/error states or a new accessibility certification. Earlier screenshots/logs/failed attempts keep their original provenance.

## Reproduction and next review

Use only new disposable loopback targets satisfying the committed fixture guard: database/role test_lab7_<16 lower-case hex>, public schema, privately supplied equal DATABASE_URL/TEST_DATABASE_URL, LAB7_TEST_DATABASE_NAME and unique E2E_RUN_ID. Verify live target/empty schema before any migration/fixture. Run the unchanged current project commands above. Keep credentials out of shell history/Git/logs.

For populated verification, privately set LAB7_UPGRADE_SNAPSHOT to a new external private file and LAB7_UPGRADE_REPORT to the stage's public JSON destination. Run the committed worker with baseline mode against an actual4535280 checkout/migrated target, then candidate migration against that **same** target, then candidate mode. The worker snapshots before auth changes, quiesces baseline writers and cleans only owned resources after candidate verification. Do not reuse historical D2 upgrade scripts pinned to older candidates. For image verification, use a new owned schema/network/private env, actual db:migrate/db:seed, then the committed image-workflow.cjs helper with its guarded target/API/report variables. Never apply these test procedures to Cloud SQL/shared data.

[Artifact manifest](evidence/green-2026-11-27/manifest.json) hashes85 redacted output/metadata/screenshot files. Private snapshots/env/settings are excluded. Local links, Markdown tables, UTF-8, whitespace, complete/staged scope, secret redaction, result counts and manifest hashes are checked before publication; frozen RED tests and prior RED evidence are byte-preserved in Git. Only the bounded4 production/migration paths changed; verification/docs are separate.

Actual documentation checks:104 changed paths (102 UTF-8 text,2 PNG),79 resolvable local Markdown links,28 consistent tables,85 matching artifact SHA256 values; independent350-execution reconciliation agrees with full184/23 totals. Protected D2/historical RED, old migrations, dependencies/configuration and frozen RED assertions are unchanged. Git working/staged whitespace and scope checks pass. These are documentation inspections, not rerun application suites.

**Next action:** independent peer review of this local implementation/migration and its evidence, followed by normal reviewed CI/integration/release sequencing. No new PR is opened in this batch, and local GREEN does not imply code approval, deployment or Issue acceptance.
