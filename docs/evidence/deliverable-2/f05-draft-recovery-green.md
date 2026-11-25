# Issue #42 F-05 draft recovery GREEN

Executed on 25 November 2026 in an isolated checkout. The G5 confirmation tested clean source commit [`ffefb2da0c812f5dee17309cefcfd3e01b30313e`](https://github.com/chaproi/club-expense-approval/commit/ffefb2da0c812f5dee17309cefcfd3e01b30313e). The evidence commit records that execution. The prior [A1–A3 record](f05-draft-recovery-red.md) and [A4 lifecycle record](f05-draft-recovery-lifecycle-red.md) retain their original results. [F-05 v1.1](../../contracts/f-05-edit-resubmit.md) and [Issue #42](https://github.com/chaproi/club-expense-approval/issues/42) retain their review status.

Only `client/src/expense-requests.tsx` changed in the source commit. It captures the attempted fields and saved revision separately, compares normalized values, scopes drafts to the current account and request in tab memory, restores only changed fields, and requires a deliberate Save on the current revision. Detail refresh and retry are reads. Non-returned requests stay read-only, and session or detail access denial clears the applicable draft. Existing API, schema, dependency lockfile, test files and assertions are unchanged.

## Focused attempts and corrections

| Attempt | Command | Exit / wall time | Collected / executed / passed / failed / skipped |
|---|---|---:|---:|
| G1 | `npm.cmd exec -- tsc --noEmit` | 2 / 3.213 s | 0 / 0 / 0 / 0 / 0 (browser not launched) |
| G2 | `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json` | 1 / 57.026 s | 14 / 14 / 12 / 2 / 0 |
| G3 | `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json --grep established` | 1 / 40.481 s | 1 / 1 / 0 / 1 / 0 |
| G4 | `npm.cmd run test:e2e -- client/test/f05-draft-recovery.spec.ts --reporter=list,json` | 0 / 25.385 s | 14 / 14 / 14 / 0 / 0 |
| G5 | `npm.cmd run test:e2e -- --reporter=list,json` | 0 / 29.955 s | 17 / 17 / 17 / 0 / 0 |

- G1 stopped at TypeScript TS18048 before any browser test. A JSX guard establishes that a draft exists before reading its conflicting values.
- G2 exposed a presentation issue: the latest-value region's concatenated text joined the revision number directly to the next field label. Moving the revision line after the saved fields made the already-correct inherited assertion meaningful. The established-draft access-denial test timed out, with a secondary teardown error after timeout.
- G3 reproduced the timeout with temporary test-local observation in an isolated copy. The backend returned the expected 404 and Playwright observed it. The exact later waiting point and the browser's internal cause were unestablished. The production denial path now consumes the safe JSON envelope before rendering denied access. G4 passed after this change and the revision presentation correction, with no changes to the tests or their timeout.
- G4 exercised the pending UI change. G5 covered the committed source, including the final action-specific prefix for Save or Resubmit on access denial. No temporary diagnostic code was committed.

## Clean-source confirmation

Windows NT 10.0.26200.0, Node v24.14.0, npm 11.9.0, Prisma 6.19.3, Playwright 1.62.1, Chromium 151.0.7922.34, PostgreSQL 17.12 (Debian 17.12-1.pgdg12+1) and Docker client/server 29.9.3 29.9.3. G5 ran from the repository root of a clean temporary clone, with a fresh `npm.cmd ci`. The test database was a private loopback container. Before migration, an independent Prisma probe verified its expected database and owner, the public schema and zero tables. The runner independently compared the target with existing app and test connection settings without printing their values.

| Command | Exit | Wall time | Result |
|---|---:|---:|---|
| `npm.cmd exec -- tsc --noEmit` | 0 | 4.651 s | Passed. |
| `npm.cmd run db:migrate` | 0 | 1.852 s | Passed. |
| `npm.cmd run build` | 0 | 4.836 s | Passed. |
| `npm.cmd test` | 0 | 4.053 s | 47/47 passed, 0 failed, 0 skipped, 0 cancelled. |
| `npm.cmd run test:e2e -- --reporter=list,json` | 0 | 29.955 s | 17/17 passed, 0 failed, 0 skipped. One Chromium worker. |
| `docker.exe --context desktop-linux build -t <owned-image-tag> .` | 0 | 14.247 s | Passed. |

The browser result includes 14 Issue #42 and 3 inherited cases across 2 files. The browser log emitted Node's NO_COLOR/FORCE_COLOR warning. npm ci reported four high-severity dependency findings. They remain a separate release item and this change does not update the dependencies. The Docker build used the existing Dockerfile and ordinary Docker cache behavior.

## Executed traceability

| Acceptance criterion | Browser cases and observed result |
|---|---|
| AC-F05-07 | T-F05-07 (1 passed). An actual stale 409 from two owner sessions exposes latest saved values, the attempted draft and a same-field conflict. The stale write leaves revision, fields and history unchanged. |
| AC-F05-08 | T-F05-08a/b (3 passed). Restore retains the other session's untouched category and amount in separate cases, performs no write and requires a manual Save using the latest revision. The Save persists one EDITED event. Discard clears the draft without a write. |
| AC-F05-09 | T-F05-09a/b (6 passed). SUBMITTED and terminal records stay read-only. A real revoked session cannot reload detail. A test-only reassignment produces a real 404 after a draft exists, then reauthorization in the same document confirms clearing. Two request selections, logout/account switching in one tab and deliberate reload cover distinct draft lifecycles. |
| AC-F05-10 | T-F05-10a/b (2 passed). A deliberately aborted detail GET retains the draft and Retry issues only reads. A second real stale Save preserves the new attempt and the newer database revision. |
| AC-F05-11 | T-F05-11a/b (2 passed). Deliberate browser transport aborts exercise Save and Resubmit messages, retained input and exact persisted-state preservation. |

The transport faults were controlled browser interruptions. Stale revisions and access decisions came from the real backend. [Sanitized command metadata, output excerpts and individual browser outcomes](f05-draft-recovery-green.json) record the observed attempts without private connection settings or session data.

## Cleanup

After the full browser suite, a separate Prisma query verified zero fixture users, sessions, requests and events. The isolated PostgreSQL container, its owned volume, the temporary clone and the uniquely tagged image were removed. The browser server released its port. The original containers and environment file bytes were unchanged. The browser suite generated two previously untracked screenshots only in the temporary clone. Both were removed from that clone and no historical screenshots were overwritten.
