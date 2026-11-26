# Campus UI redesign verification

26 November 2026 (Asia/Bangkok). Local verification, not hosted CI or independent design approval.

**Current integration:** [PR #46 approval and normal staging merge](integration-2026-11-26.md) satisfy the earlier publication gate. Integrated HEAD is `056f9bc7cc72002f0e2ac262343edbae0beca9b1`; its incoming changes are documentation only. Earlier statements that #46 was open are historical checkpoints, and the executions below keep their original tested revisions.

**Responsive follow-up:** [Reviewer breakpoint correction](reviewer-breakpoints/verification.md) records source 34269152acdf4ebb06667516622b6fabd1e4a140, its passing build and four focused width checks. All earlier results and screenshots below retain their original source provenance.

## Source and scope

- Starting staging: [717536287117118d508e08d6cc68764a5df537c7](https://github.com/chaproi/club-expense-approval/commit/717536287117118d508e08d6cc68764a5df537c7).
- Direction recorded before implementation: [7716080f83ea86a54e06469ee8bf939c6dd6a4d4](https://github.com/chaproi/club-expense-approval/commit/7716080f83ea86a54e06469ee8bf939c6dd6a4d4), [design](design.md).
- Tested clean implementation: [465ebea693c5cebe6e6ebeb4460f8e2d79162d3b](https://github.com/chaproi/club-expense-approval/commit/465ebea693c5cebe6e6ebeb4460f8e2d79162d3b).
- Four production paths: `client/src/main.tsx`, `client/src/expense-requests.tsx`, `client/src/styles.css`, `client/src/assets/campus.svg`. [Asset provenance](assets.md) accompanies the source.
- Authentication/state functions, account-keyed component boundary, request mutations, draft reconciliation/clearing, revision tokens and history data are preserved. The TypeScript AST comparison in [verify-logic.cjs](verify-logic.cjs) confirms all ten inherited named functions' statements before their render return are identical to staging. Render changes add presentation, currency formatting, selection state, pending feedback and a keyboard skip link.
- Existing tests, backend, contracts, Prisma schema/migrations, package/lockfile, Docker/Compose, CI and environment files are unchanged. No dependency or product feature was added. The existing reviewer counts are restyled, not replaced with new financial metrics.
- The original local checkout remains on its existing branch; development used a separate clone and `feat/sprint2-campus-ui`.

## Commands and actual results

The successful application checks ran sequentially on the clean implementation SHA above. [commands.json](commands.json) retains UTC start/end, exit, signal, duration and dirty state for each. Tests were not edited.

| Command (repository root) | Actual result | Duration | Output |
|---|---|---:|---|
| `npm.cmd exec -- tsc --noEmit` | Exit 0; separate TypeScript check | Not separately timed | Followed by the sandbox-blocked build below; the successful build also reruns TypeScript |
| `npm.cmd run build` | Exit 0; TypeScript and production build passed | 4.506 s | [build.log](build.log) |
| `npm.cmd test` | Exit 0; 47 executed / 47 passed / 0 failed / 0 skipped / 0 cancelled, six test files | 5.400 s command; 4.908 s test runner | [api.log](api.log) |
| `npm.cmd run test:e2e` | Exit 0; 19 executed / 19 passed / 0 failed / 0 skipped; two files, one Chromium worker, no added retries | 62.318 s command; Playwright reported 1.0 min | [browser.log](browser.log) |
| `node ../visual.mjs after` (the retained [capture.mjs](capture.mjs)) | Exit 0; nine explicitly recorded presentation observations, no page errors | 4.442 s | [after-visual.json](after-visual.json) |
| `node ../verify-logic.cjs` | Exit 0; ten inherited non-render function bodies unchanged | Not separately timed | [verify-logic.cjs](verify-logic.cjs) |

Build output: 29 Vite modules, local SVG 4.41 kB, CSS 14.84 kB (4.13 kB gzip), JS 240.77 kB (74.80 kB gzip). No external asset/font network is needed.

The existing browser suite exercises real submission/decision/history, stale reviewer conflicts, return/edit/resubmit and DB summary; all current F-05 recovery cases including changed-field Restore, manual Save, Discard, read-only transitions, established-draft denial, logout/account switch/reload, failed refresh/GET-only retry, repeated conflict, Save/Resubmit transport errors, and both BF-01 clean-draft regressions. Passing these tests does not establish every possible layout or assistive-technology combination.

## Rendered observations

The retained capture harness launches real Chromium, the built React/Express application and authenticated PostgreSQL fixtures. Successful business responses are real. The initial synthetic cohort has six requests spanning SUBMITTED, RETURNED, APPROVED and REJECTED. Synthetic Maya Chen and Alex Rivera accounts are not operational users. Follow-up fixture mutations create actual history; the long-history observation creates a new owned returned request with exactly 20 workflow events.

- Desktop 1440×1000: login, requester creation/list/detail/history, real stale-Save conflict and reviewer summary/decision layout inspected.
- Mobile 390×844: login, requester and conflict full-page screenshots inspected. Header wraps into two rows; titles, reasons and field values wrap; list scrolling is contained and native buttons remain keyboard reachable. Normal page scrolling reaches the detail and recovery controls.
- Tablet 834×1112: no page-wide horizontal overflow observed. No tablet screenshot is claimed.
- Login Tab/Shift+Tab sequence, visible input focus, Enter request selection and skip-link focus transfer to content passed.
- `prefers-reduced-motion: reduce` removes nonessential animations, including login artwork. Normal motion uses short entrances/press feedback and a six-pixel artwork drift, with no interaction-blocking entrance.
- A controlled held request showed pending `aria-busy`, disabled approval and honest update feedback, followed by an actual HTTP 200 and authoritative approved history.
- A **controlled one-shot list transport abort** showed the real error UI; restoring transport and deliberate GET-only Retry recovered real data. It is not evidence of a naturally occurring outage.
- Twenty genuine history events remained reachable with mobile wrapping.
- Representative computed-color contrast: login intro 4.59:1; primary button 9.22:1. The calculation uses the actual computed foreground/background (with inherited page background). It is a limited sample, not a WCAG certification or complete contrast audit.

## Before/after screenshots

All nine images below were visually inspected at useful resolution. [screenshots.json](screenshots.json) records byte lengths and SHA-256. No credentials, tokens or operational user data appear.

| State | Before | After |
|---|---|---|
| Desktop login | [Before](screenshots/before-login-desktop.png) | [After](screenshots/after-login-desktop.png) |
| Desktop requester workspace | [Before](screenshots/before-workspace-desktop.png) | [After](screenshots/after-workspace-desktop.png) |
| Mobile login | — | [After](screenshots/after-login-mobile.png) |
| Mobile requester workspace | — | [After](screenshots/after-workspace-mobile.png) |
| Real stale Save / latest vs draft | — | [Desktop](screenshots/after-conflict-desktop.png), [mobile](screenshots/after-conflict-mobile.png) |
| Reviewer decisions and existing summary | — | [Desktop](screenshots/after-reviewer-desktop.png) |

Before captures: 25 Nov 2026 18:54:23–24 UTC (26 Nov 01:54 Bangkok), clean direction commit 7716080; its application bytes equal starting staging. [before-visual.json](before-visual.json) records all original captures; only the two inspected desktop before images are published here. The original synthetic title contained a question-mark placeholder from harness text encoding; final fixture titles use plain ASCII hyphens.

Final captures: 26 Nov 2026 04:37:16–21 UTC (11:37 Bangkok), source 465ebea. The dirty-state field records only two untracked screenshots generated by the existing browser suite, not production changes. Those outputs were subsequently archived outside the checkout, without overwriting historical artifacts. Final screenshot histories contain the real synthetic setup edits from the retained attempts.

## Environment, attempts and limitations

Windows NT 10.0.26200, Node 24.14.0, npm 11.9.0, TypeScript 5.9, Prisma/client 6.19.3 with the unchanged scoped overrides, Vite 7.3.7, Playwright 1.62.1 / Chromium 151.0.7922.34, Docker Desktop Linux context and PostgreSQL 17.12. This is local Chromium evidence; Safari, Firefox, physical mobile devices and screen-reader audio were not verified. No deployment, benchmark or acceptance promotion occurred.

Earlier attempts are retained rather than rewritten as success:

1. Initial capture setup stopped on a harness port-variable ReferenceError, then on a corrected probe/app listener mismatch (`ECONNREFUSED`). No application semantic failure was inferred. The corrected harness produced the before captures.
2. Preliminary dirty-source visual capture passed; its provenance remains in [preliminary-visual.json](preliminary-visual.json). The later mobile-header/skip-link polish is captured only in the final images.
3. On resumption, the saved disposable database was unreachable because Docker Desktop's engine was stopped. No tests collected. After starting Docker Desktop, ownership was verified, only the owned exited container was restarted, and its newly assigned loopback binding was used; the live database/role/schema were rechecked.
4. TypeScript passed; the first build in the restricted execution sandbox failed to read the parent directory/config. The identical build succeeded with the approved execution access. No source/configuration or build timeout was changed.
5. All three application commands in commands.json exited 0. The outer recorder subsequently exited 1 because its final bookkeeping still expected four commands after the separate TypeScript command had been removed from that loop. The condition was corrected; no application command was rerun for that recorder-only defect. Independent fixture/connection verification had already succeeded.
6. The extended visual harness initially raced `unroute` with a still-running `route.continue` (`Route is already handled!`). Its failure was retained outside the repository. Awaiting the handler before removing it fixed the observer lifecycle; the final capture/observation command exited 0 without a production change.
7. The first cleanup removed all owned domain rows and disconnected, then Docker correctly refused to remove the still-running container. The cleanup helper was corrected to stop that verified owned container after draining, then remove it and its anonymous volume. The final independent checks passed.

Non-failing warnings: the intentionally environment-file-free clone reports `.env not found. Continuing without it.`; child processes report FORCE_COLOR overriding NO_COLOR; Git reports LF→CRLF worktree normalization. No assertions, timeouts, retries, pools or business behavior were altered.

## Isolation and cleanup

The fixture guard checks the `test_club_ui_` database prefix, loopback binding and exact live database/role/public-schema identity before writes. A newly created, ownership-labelled disposable PostgreSQL container and its own volume were used. No host/shared/operational database or existing environment file was read into evidence, reset or migrated.

[regression-cleanup.json](regression-cleanup.json): API/browser tests restored the pre-run 2 users / 6 requests / 11 events; zero idle transactions. Final [cleanup.json](cleanup.json): zero users, sessions, requests and events; no other client connections or idle transactions; the owned container and anonymous volume are absent; the private runtime credential file was deleted. No owned Node/browser process or listener on 4173 remained. Newly generated browser screenshots are archived separately; tracked historical bytes and all protected paths remain unchanged.

## Publication gate and review scope

The latest successful fetch/recheck on 26 Nov 2026 still found staging at 7175362 and [PR #46](https://github.com/chaproi/club-expense-approval/pull/46) **open, unmerged**, head dd00cac616d0dae30bd89f2ca419a22518bfc8f5. Per the requested workflow, the UI PR must wait for that documentation integration, then incorporate latest staging without replacing its documentation.

The prepared review scope is presentation/accessibility polish plus these evidence files. Peer review should assess composition, mobile scrolling, contrast/readability, motion, conflict/draft distinction and preserved workflow names. No author/AI approval is substituted for independent review. The source is locally verified; the eventual integrated branch and hosted CI keep their own provenance.

Documentation checks: 17 UTF-8 text files decoded strictly; 27 local links resolved; Markdown table columns validated; nine screenshot byte lengths/digests matched. Retained harness JavaScript syntax and unchanged protected-path diff checks passed. Final full diff whitespace check passed after removing documentation-only trailing spaces/blank lines.
