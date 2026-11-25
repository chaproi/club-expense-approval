# Issue #42 F-05 draft recovery RED

25 November 2026 (Asia/Bangkok). This is tests-first evidence on unchanged application code. The new contract cases are RED where marked below. GREEN and peer review are pending.

[Defect #42](https://github.com/chaproi/club-expense-approval/issues/42) follows [F-05 #36](https://github.com/chaproi/club-expense-approval/issues/36). Staging baseline [`ed06b11`](https://github.com/chaproi/club-expense-approval/commit/ed06b112e8a61890b10daaf76ddbd9632f77c88c). The [F-05 v1.1 contract](https://github.com/chaproi/club-expense-approval/blob/cda506993dbab0b15af1bd70c96265b69117ef6a/docs/contracts/f-05-edit-resubmit.md) preceded all three test commits.

## Tested revisions and commands

| Attempt | Tested SHA | Browser command | Collected / executed / passed / failed / skipped | Exit and elapsed |
| --- | --- | --- | --- | --- |
| A0 inherited smoke | [`3f44f153f24ba8b08e2305b2128362e96299e237`](https://github.com/chaproi/club-expense-approval/commit/3f44f153f24ba8b08e2305b2128362e96299e237) | `npm.cmd run test:e2e -- client/test/expense-decisions.spec.ts --grep T-09` | 1 / 1 / 1 / 0 / 0 | 0 / 30.876 s |
| A1 first focused run | [`3f44f153f24ba8b08e2305b2128362e96299e237`](https://github.com/chaproi/club-expense-approval/commit/3f44f153f24ba8b08e2305b2128362e96299e237) | `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json` | 13 / 13 / 1 / 12 / 0 | 1 / 133.260 s |
| A2 fixture confirmation attempt | [`615666a99c65c46838d250deecfdaa6c0e985621`](https://github.com/chaproi/club-expense-approval/commit/615666a99c65c46838d250deecfdaa6c0e985621) | `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json --grep "revoked owner session\|keeps a draft only for its request"` | 0 / 0 / 0 / 0 / 0 | 1 / 20.122 s |
| A3 full focused confirmation | [`1a903f4fe5954983b6ace0295bdf4e4df6a6fa1e`](https://github.com/chaproi/club-expense-approval/commit/1a903f4fe5954983b6ace0295bdf4e4df6a6fa1e) | `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json` | 13 / 13 / 1 / 12 / 0 | 1 / 144.873 s |

| Setup run | npm.cmd ci | npm.cmd exec -- tsc --noEmit | npm.cmd exec -- playwright install chromium | Chromium launch/version check | npm.cmd run db:migrate |
| --- | --- | --- | --- | --- | --- |
| A1 | 0 / 35.506 s | 0 / 6.291 s | 0 / 2.913 s | 0 / 0.898 s | 0 / 3.698 s |
| A2 | 0 / 30.782 s | 0 / 7.054 s | 0 / 3.562 s | 0 / 1.083 s | 0 / 4.522 s |
| A3 | 0 / 31.630 s | 0 / 6.812 s | 0 / 3.789 s | 0 / 1.050 s | 0 / 3.649 s |

All durations above are wall-clock command durations. Playwright A3 reported 142.962 s. Its full run window including setup and cleanup was `2026-11-24T21:04:07.271Z` to `2026-11-24T21:07:26.156Z`. The included inherited smoke ran the normal browser workflow on real application endpoints.

Windows PowerShell host, Node 24.14.0, npm 11.9.0, Prisma Client 6.19.3, PostgreSQL 17.12 in a named disposable Docker container, and headless Chromium 151.0.7922.34 on Playwright 1.62.1. Docker client and engine were 29.9.3. Each run used a clean clone and committed Playwright configuration, one worker and the default retry policy (zero retries).

Before migration in each attempt, the real Prisma connection confirmed the isolated database and user, `public` schema and zero tables. The freshly allocated PostgreSQL port was loopback-only and distinct from the original private targets. All three migrations completed. The browser setup booted the real built app and used separate real API and browser sessions. Fixture Save and Resubmit payloads used authoritative revisions. No login, fixture provisioning, migration or test-collection failure remains in A3.

## Failures and corrections

- **A1** had 11 behavioral failures and one fixture failure. The passing revoked-session case left its worker alive. Per-case records had previously been removed only at worker teardown, so the next selection/account case saw two buttons for the shared fixture title and stopped at Playwright strict-mode resolution. A1 also showed that the first Title-marker query could match generic changed-request text.
- **A2** included [`615666a`](https://github.com/chaproi/club-expense-approval/commit/615666a99c65c46838d250deecfdaa6c0e985621) to delete only owned expense records after each case while retaining worker-level cleanup. The quoted name filter produced `No tests found` after web-server setup. This is a selection failure and provides no behavioral RED.
- **A3** included [`1a903f4`](https://github.com/chaproi/club-expense-approval/commit/1a903f4fe5954983b6ace0295bdf4e4df6a6fa1e), giving the Title-conflict test the documented independent field edits and a field-specific marker locator. A3 used the original file-only invocation and exercised the full new spec. The earlier duplicate-title failure was gone. Every failed case reached a contract-facing assertion.

## A3 assertion outcomes

| STS | Cases | Observed outcome |
| --- | ---: | --- |
| T-F05-07 | 1 fail | Real stale PATCH returned `409 INVALID_STATE`, authorized detail and list recovered, and the persisted snapshot stayed exact. The latest/draft panels, attempted title and explicit Title conflict marker were absent. |
| T-F05-08a | 2 fail | Each stale Save preserved the newer revision and exact fields/history. No Restore control appeared, so field reconciliation, dirty Resubmit gating after Restore and a manual Save using the refreshed revision were unreached. |
| T-F05-08b | 1 fail | No Discard control appeared. The no-extra-write and exact DB assertions still ran. The deliberate Discard assertions were unreached. |
| T-F05-09a (SUBMITTED, APPROVED) | 2 fail | Real state changes remained read-only; the local draft and Discard control were absent. The stale Save did not change the record or append history. |
| T-F05-09a (revoked session) | 1 pass | After genuine stale `409`, the actual logout revoked the browser session and its refresh returned `401`. No recovery UI or editable detail was exposed and DB history stayed exact. This observes safe denial, while the implementation still lacks a real draft to clear. |
| T-F05-09b | 2 fail | The draft was absent after reselecting the same request and the reload warning was missing. Cross-owner `404`, absence from the other account and authorized readback after re-login or reload still passed. Clearing a previously stored draft remains to be proved in GREEN. |
| T-F05-10a | 1 fail | The real `409` was followed by one controlled detail GET abort. Writes stayed blocked and the persisted snapshot was unchanged. The draft and read-only retry were missing, so a successful deliberate GET-only retry was unreached. |
| T-F05-10b | 1 fail | First conflict reached genuine `409`, but Restore was missing. The second explicit Save and repeated-conflict assertions were unreached. |
| T-F05-11a/b | 2 fail | Controlled Save and Resubmit aborts preserved fields/state and exact database history. Both showed `Could not save the decision.` rather than feedback for their specific action. |

Backend conflicts and authorization denials were real. Only the tested refresh and write transport failures were injected. For denied-session coordination, the route forwarded the real GET after an authenticated logout. Request observers counted browser mutations and verified payloads independently of Prisma record and event snapshots.

## Cleanup and scope

After the executed browser suites, an independent Prisma probe found zero users, sessions, expense requests and events in the disposable database. In each attempt the app listener on 4173 was closed, the owned database container and volume were removed, and the original containers and private environment files stayed unchanged. No passwords, connection strings, cookies or tokens are included in this record.

The first and final test logs showed the existing `NO_COLOR`/`FORCE_COLOR` warning and expected `.env not found` note from the isolated clone. `npm ci` reported four existing High audit entries. Dependency disposition and populated Sprint 1 database upgrade verification remain separate release gates.

From the contract commit, the only tracked diffs are `client/test/f05-draft-recovery.spec.ts` and this evidence record. Existing suites, production, schema, lockfile and environment files were preserved. The results do not establish GREEN, completion of AC-F05-07 through AC-F05-11 or release readiness.
