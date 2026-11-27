# Lab 7 tests-first RED — 27 November 2026

## Identity and limits

[Issue #49](https://github.com/chaproi/club-expense-approval/issues/49). Branch **feat/lab7-category-limits**, created in a new isolated worktree from freshly fetched **453528073038a3122ecd7abb0adac7bf09a1dc41**. Main/deployed application remains **cc6b04c8e98191be591a3b755d25988148523909**. Their production, schema, applied migrations, dependencies, Docker and workflow bytes match; intervening staging changes are proposal documents only. No applicable AGENTS.md was found in this checkout or its applicable ancestors; README, reviewer handoff, existing contracts/tests and the complete submitted PR50 review were read.

The [contract acceptance record](contract-acceptance-2026-11-27.md) records thananun-7203's approval of c7f1c88 at 2026-11-27T06:11:30Z and merge4535280 at07:05:24Z. Instructor/TA approval remains **Not required under updated instructor announcement**. This run establishes semantic RED, not implementation, migration, peer code approval, release or operational acceptance.

Commit sequence:

1. Acceptance/plan **5995e59f8168a7a2a8ddbf1fa127410a7a1ae09b**.
2. Tests committed **before every test execution**, **f08672dda573907cba0ef686c5d80e74f81a53e2** ([complete test diff](https://github.com/chaproi/club-expense-approval/commit/f08672dda573907cba0ef686c5d80e74f81a53e2)).
3. This evidence is a later documentation-only increment. Application bytes tested were the unchanged pre-change4535280 production (matching deployedcc6b04c). Working tree/index were clean at test execution. Evidence publication is not a new application execution.

## Runtime, isolation and preparation

Windows10.0.26200, Node24.14.0, npm11.9.0, TypeScript5.9.3, Prisma CLI/generated Client6.19.3; Docker Desktop Linux engine29.9.3, PostgreSQL17.12 (Debian17.12-1.pgdg12+1). Playwright1.62.1 used real Chromium, one worker, zero retries; its installed bundled browser manifest declares Chromium151.0.7922.34/revision1234. No browser version query was added to the run.

A new labelled, disposable PostgreSQL container used a random dedicated test database/role, public schema and ephemeral **loopback-only** port. Before migrations, a live SELECT verified current database, user and schema against the owned identity and **zero public tables**. The new test helper repeats the loopback/database/role/schema live guard before fixture writes. No existing .env was copied/read for execution; URLs/passwords were supplied privately through child environment only. No operational/shared Cloud SQL target was used.

Fresh `npm.cmd ci`: exit0,29.681s,152 packages installed/153 audited; generated Client6.19.3, zero reported vulnerabilities in that install output (not a new dependency-remediation assessment). Original `npm.cmd run db:migrate`: exit0,3.379s. Exactly three inherited migrations were applied: auth foundation, expense requests, Return/Resubmit. The actual CHECK remained `amountBaht >= 1 AND amountBaht <= 100000`. No new migration/schema was introduced.

Two initial pg_isready polls returned2 while starting; the third returned0 before the live guard and migrations. These are retained readiness observations, not test failures. The normal Playwright webServer performed its existing build/migrate/start on4173; no preexisting listener was reused. No competing repository tests/builds ran.

## Actual commands and results

All commands ran sequentially, once each, from the repository root with the private isolated environment. UTC starts are in [runtime.json](evidence/red-2026-11-27/runtime.json); add7hours for Bangkok (the test commands ran15:13–15:14 on27November). Wall durations include command startup; runner durations below come from the original reports.

| Attempt / exact command | Collected / executed | Pass / fail / skip / cancelled | Exit | Wall / runner duration |
|---|---|---|---|---|
| types-1: `npm.cmd exec -- tsc --noEmit` | N/A | N/A |0 |7.515s / N/A |
| unit-1: `node --import tsx --test server/test/expense-input.test.ts` |34 /34 |24 /10 /0 /0 |1 |0.563s /0.445590s |
| api-1: `node --import tsx --test server/test/category-limits.test.ts` |51 /51 |35 /16 /0 /0 |1 |5.050s /4.919019s |
| inherited-1: `node --import tsx --test server/test/expense-requests.test.ts server/test/return-resubmit-summary.test.ts` |27 /27 |27 /0 /0 /0 |0 |5.775s /5.663480s |
| browser-1: `npm.cmd run test:e2e -- client/test/category-limits.spec.ts --reporter=list,json` |4 /4 |1 /3 /0 /0 |1 |42.826s /41.230486s |

Totals across these focused test commands: **116 collected/executed,87 passed,29 failed,zero skipped/cancelled**. Browser JSON reports zero flaky cases and exactly one attempt per case. No unfiltered/full regression or Docker build was run. Browser normal setup's required production build passed, but is not a separately invoked release build.

No collection, missing-helper, TypeScript, fixture, browser-availability or selection error established these failures: all29 are executed behavioral assertions. No test command was repeated. A native fetch Response accessor typo was corrected during authoring, before the test commit/first execution; it is not a RED result. A tool-code parse error while authoring the external runner occurred before any runner command executed; no test attempt was started by it.

Warnings retained in the actual browser log: absent .env (intentional private environment), and NO_COLOR ignored because FORCE_COLOR is set. Git warned about LF→CRLF working-copy conversion on new test paths; committed UTF-8 contents and whitespace were checked. An elevated Git status during cleanup inspection hit Git's different-account ownership protection; the host process/port observations succeeded. Subsequent elevated Git reads use a repository-scoped safe.directory option, without a global configuration change.

## Independently expected failures and reached assertions

Literal expectations in tests do not import a future policy helper or derive expectations from production. Each category has independent1/max/max+1 assertions; cross-category125000 and110000 cases are independently reported.

| Failure group | Count | Expected → actual | Executed evidence / later steps |
|---|---|---|---|
| Unit creation and returned parser |10 | ACTIVITY150000/125000/110000 and EQUIPMENT120000/110000 accepted → parser returns null | Both current parser interfaces executed; rejection/ordinary/TRAVEL controls pass. |
| Real POST creation |5 |201 for those five newly permitted pairs →400 | Real authenticated HTTP ran; high-value persisted readback/projection assertions after status are **unreached**. |
| Real owner RETURNED PATCH |5 |200 for those five pairs →400 | Each old-range request was genuinely submitted/returned first. High-value revision/event/readback assertions after status are **unreached**. |
| Direct SQL pair UPDATE |5 | one affected row, no error → native23514 CHECK violation, no affected-row result | Valid old-range prerequisites and SAVEPOINTs executed. Every probe restored and compared the complete original row/events before policy assertion. |
| Direct SQL category-only chain |1 | first ACTIVITY125000 update succeeds →23514 | SAVEPOINT rollback executed. EQUIPMENT/TRAVEL category-only rejection steps depend on that first newly permitted pair and are **unreached**; ordinary100000 category-only updates for all categories passed independently. |
| Browser create / returned form |2 | ACTIVITY max150000 →100000 | Login, real fixtures, form selection and125000 entry succeeded. Default5s locator assertions repeatedly observed the old attribute; these are assertion failures, not setup/case-timeout errors. Later switching/feedback/no-write/manual-save checks are **unreached**. |
| Browser restored-draft journey |1 | ACTIVITY125000 valid before intentional stale Save → native validity false | Separate real owner session successfully saved latest TRAVEL100000 first. The browser's stale409, draft/latest display, Restore-invalid-pair feedback, no-write controls, corrected manual Save/Resubmit and final history checks are **unreached**. No fabricated409/success was fulfilled. |

[Exact failed test names](evidence/red-2026-11-27/results.json) and sanitized original assertion stacks/expected-versus-actual are retained in [unit output](evidence/red-2026-11-27/unit-1.log), [API/SQL output](evidence/red-2026-11-27/api-1.log), [browser output](evidence/red-2026-11-27/browser-1.log) and [Playwright JSON](evidence/red-2026-11-27/browser-1-playwright.json). Assertion failures do not imply subsequent assertions executed.

## Preserved controls and traceability

| Authority | Actual test paths / reached coverage | Remaining obligation |
|---|---|---|
| AC-L7-01; STS-L7-01/03/04 | `server/test/expense-input.test.ts`, `server/test/category-limits.test.ts`: independent category boundaries/cross-pair results for both parsers and real POST/PATCH. New-range acceptance RED; ordinary minimum/TRAVEL and invalid maxima pass. | New-range persisted values/history/DTOs after successful acceptance; complete browser journeys. |
| AC-L7-02; STS-L7-01/02 | Same paths: max+1,0,negative,fractional,string,null,boolean,object,array,missing/unknown category, forged fields; unit NaN/Infinity. Invalid API attempts assert exact fields/timestamps/revision/events unchanged. Original title/body negatives retained. | Category-specific truthful API feedback after implementation; continued exact preservation. |
| AC-L7-03; STS-L7-03/04 | `client/test/category-limits.spec.ts`: three semantic failures; independent TRAVEL control **passes** maximum100000 / maximum+1=100001, no POST for invalid submission, explicit valid real201, exact pair/revision0/one SUBMITTED and list readback. | ACTIVITY/EQUIPMENT switches, retained values/no clamp, accessible description and no-write controls after failed earlier assertions. The four cases are focused RED, not every planned browser matrix permutation. |
| AC-L7-04; STS-L7-04/06/07 | New API ordinary edit→resubmit→approve preserves ID/assignment/old history and exact revision/events. Inherited race/stale/repeated-resubmit/restart assertions pass in `server/test/return-resubmit-summary.test.ts`. New real two-session setup reaches latest TRAVEL Save; later restored high draft journey unreached. | Complete new high-range conflict/Restore/manual Save/Resubmit; high-range concurrent commands. Existing draft-recovery/BF-01 browser suite not rerun here and not relabelled as current evidence. |
| AC-L7-05; STS-L7-05/06 | New ordinary/TRAVEL anonymous401,wrong-role403,cross-owner404,unassigned read404,Origin403,state/stale409 with unchanged snapshots; inherited access/workflow assertions pass in the two existing API files. Safe successful ordinary projections checked. | Larger proposed pairs under all actors/revoked sessions, missing-reviewer503 and overflow use existing regressions in GREEN; not newly executed exhaustively here. |
| AC-L7-06; STS-L7-08/09 | New direct SQL matrix on original migrated database, native23514 evidence, rollback preservation and category-only ordinary controls. High category-only chain stops explicitly at its first new-policy assertion. | New additive migration; direct INSERT/amount-only/category-only enforcement, fresh/populated preservation, old migration checksums, rollback limitations and new-policy restart verification. No migration-file-absence RED. |
| AC-L7-07; STS-L7-07/09 | `server/test/expense-requests.test.ts` + `server/test/return-resubmit-summary.test.ts`:27 pass including old decisions/history/restart, Return/Edit/Resubmit, authorization, races and assigned status counts. | Full unchanged regression/browser suites after GREEN and high-range lifecycle readback. F-06 totals,F-07,F-08 remain Planned. |
| AC-L7-08; STS-L7-10 | Actual approved contract and tests-before-code chronology recorded separately. | Implementation, independent code review, CI, staging/main release, image/migration/deployment and selected live changed/preserved checks remain unexecuted/pending. Deployedcc6b04c unchanged. |

Only two inherited amount expectations were legitimately superseded: EQUIPMENT100001-invalid→120001-invalid in the parser test, and ACTIVITY100001-invalid→150001-invalid in T-F05-02. The new positive matrices supplement them. No other old assertion was removed/weakened; all other existing tests/helpers are byte-identical.

## Isolation, cleanup and reproduction

The new helper owns its four synthetic accounts before inserts, records API-created request IDs immediately, closes its listener, deletes only requests belonging to those owned accounts (events cascade), then sessions/users, and always disconnects Prisma. Browser requests belong to the same owned Requester even if a status assertion fails. The normal server stops through Playwright teardown; each restarted failed-test worker reports cleanup. No credentials, cookies, hashes, private contents or connection strings are published.

After all commands, an independent PostgreSQL query returned **0 users /0 sessions /0 requests /0 events /0 other client backends**. This proves no idle transactions or retained test clients remained in the owned database before deletion. Host inspection found **0 worktree-owned node/browser/command processes and no4173 listener**. Label-verified owned container/volume were removed; absence verified and all three original containers retained their previous state. Private runtime settings were deleted. See [cleanup query output](evidence/red-2026-11-27/cleanup-domain.log) and [runtime cleanup records](evidence/red-2026-11-27/runtime.json).

For reproduction, use a **new** disposable loopback PostgreSQL target with database and role named `test_lab7_<16 lower-case hex>`, public schema, private random password and no existing tables. Privately set DATABASE_URL and TEST_DATABASE_URL to that target, LAB7_TEST_DATABASE_NAME to its name, and E2E_RUN_ID to a new unique marker. Verify live identity before `npm.cmd run db:migrate`; use the three unchanged migrations. Then run the exact commands above sequentially. No credentials belong in shell history/evidence; never reuse/reset operational/shared data. The helper intentionally rejects other targets. The execution runner stayed outside Git and supplied private values only to child environments.

[Manifest](evidence/red-2026-11-27/manifest.json) hashes the12 published redacted output/metadata artifacts; original external logs remain untouched. Results JSON is independently parsed from actual Node summaries/Playwright JSON, not a substitute for executed assertions. Redaction removes connection strings, terminal color escapes and local worktree paths; published copies normalize line endings to LF and remove trailing display whitespace. The first staged whitespace check caught runner-produced trailing spaces; these copies were corrected before commit. One external publisher-edit command had a quoting/parse failure before writing files; it started no test or database operation and was replaced with a direct patch. This report is not a new claim about old D2/Lab6 UAT, independent peer acceptance or grading.

## Documentation and scope checks

Pre-publication checks covered23 changed paths: strict UTF-8 decoding, no BOM,33 resolvable local Markdown links,16 consistent Markdown tables,12 matching artifact hashes, secret-pattern redaction and exact116/87/29/0 result reconciliation. Git whitespace checks pass. All executed tests still match f08672d; the only changed paths are Lab7 documentation and the five explicitly reviewed test/helper paths. Protected production/UI/schema/applied migrations/dependencies/configuration are unchanged from4535280. Earlier D2 documents and artifacts are untouched. These documentation checks do not execute application tests again.

**Next authorized stage requires a separate GREEN instruction.** Implement only the accepted category-pair rule in current server/UI and a new additive CHECK migration, then execute the currently unreached assertions and planned fresh/populated/regression checks. No such change has been made in this RED batch.
