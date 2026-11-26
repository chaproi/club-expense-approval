# Issue #42 F-05 draft lifecycle RED (A4)

25 November 2026 (Asia/Bangkok). This focused run follows the [original A1–A3 record](f05-draft-recovery-red.md). Those results and commits are unchanged.

Tested `1667ec2877ba926ad9ca902de50947c14037bf4a` on `fix/issue-42-f05-draft-recovery`, the test-only child of `e0e359d2392f2be3a876eda6fecdaef40a9c7fbf`. The [F-05 v1.1 contract](../../contracts/f-05-edit-resubmit.md) and application code were unchanged. Tracked scope before execution was the existing `client/test/f05-draft-recovery.spec.ts` only.

## Execution

| Command | Exit | Wall time |
| --- | ---: | ---: |
| `npm.cmd ci` | 0 | 17.105 s |
| `npm.cmd exec -- tsc --noEmit` | 0 | 4.263 s |
| `npm.cmd exec -- playwright install chromium` | 0 | 1.878 s |
| Playwright Chromium launch/version check | 0 | 0.800 s |
| `npm.cmd run db:migrate` | 0 | 2.181 s |
| `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json` | 1 | 129.383 s |

Playwright reported **14 collected, 14 executed, 1 passed, 13 failed, 0 skipped** in 128.025 s. The focused command started at `2026-11-24T21:17:06.078Z`. The full run, including setup and cleanup, lasted from `2026-11-24T21:16:35.665Z` to `2026-11-24T21:19:16.548Z`. There were zero global reporter, setup or selection errors and no failed-case timeouts. All failed cases reached behavioral assertions.

Windows, Node 24.14.0, npm 11.9.0, Prisma 6.19.3, Docker 29.9.3 and PostgreSQL 17.12. Playwright 1.62.1 used headless Chromium 151.0.7922.34, one worker and zero retries with the committed configuration. The clone had no private environment files. Before migration, a live Prisma query confirmed the disposable database and role, loopback-only binding, `public` schema and zero tables. The target was distinct from the original private endpoints. The first readiness probe returned exit 2 during startup and the second succeeded. All three committed migrations applied.

Expected `.env not found` and `NO_COLOR`/`FORCE_COLOR` output was retained. `npm ci` still reported four High audit entries, which remain separate from this issue.

## Lifecycle assertions reached

| Case | Reached and observed | Unreached behavior |
| --- | --- | --- |
| T-F05-09a existing revoked-session test | Passed real logout/revocation, HTTP 401 during fresh detail load, safe feedback, and unchanged record/history. The browser also reauthenticated through the form after UI logout. | This case does not establish clearing a previously retained draft. |
| T-F05-09a new established-draft denial test | Real stale Save returned 409, refreshed authorized detail/list and proved exactly one attempted PATCH with unchanged persisted state. Failed at `a real draft exists before access is revoked`. | The fixture-only owner change, real detail GET 404, safe error, reauthorization and clearing in the same document were gated on seeing the draft. None ran in this case. |
| T-F05-09b same-tab account switch | Real 409 and exact persistence check passed. Another owned request showed no draft. Failed at `reselecting the same request retains its draft before logout`. | Logout and the switch to the other account and back, along with the no-navigation/no-extra-tab checks, were unreached in this case. |
| T-F05-09b deliberate reload | Real 409 and exact persistence check passed. Missing warning, then failed at `a real draft exists before the deliberate page reload`. | Deliberate reload and post-reload clearing were unreached. |

Initial page navigation now runs once per test in the Playwright hook. Login itself fills and submits the existing form. The account and denial tests make the visible draft a hard prerequisite. The new denial case uses only an owned disposable fixture to produce the real 404: it temporarily changes the request owner in PostgreSQL and restores it in `finally`, with no forged HTTP response. After restoring access it explicitly saves a separate owned expense to refresh the list, then compares the original record and its full history again. Neither account switching nor denial/reauthorization relies on page reload.

The other ten failing cases reached the existing contract assertions for separated drafts and overlap, Restore/Discard, non-RETURNED read-only draft, failed refresh/retry, repeated conflict, and Save/Resubmit messages. They showed the same behavioral gaps as the earlier RED confirmation.

The committed [command output excerpt](f05-draft-recovery-lifecycle-a4.log) and [Playwright JSON extract](f05-draft-recovery-lifecycle-a4.json) come from A4. The complete sanitized stdout/stderr and structured Playwright JSON were retained separately in the local evidence folder. These results do not establish GREEN or lifecycle acceptance.

## Cleanup

Independent Prisma counts found zero users, sessions, requests and events before removing the disposable container and volume. Port 4173 was free after execution. The generated private env file and original raw JSON were removed after preserving sanitized evidence. The original containers, environment-file bytes and working tree were unchanged. No application, schema, dependency or Playwright configuration changed.
