# Reviewer breakpoint correction — 26 November 2026

## Finding and correction

The Reviewer grid required 320 + 420 + 20 = 760 CSS px, while the workspace had 4% horizontal padding on each side and only collapsed at a 760px viewport. The actual available grid width is about 92% of the viewport. At 761/768px the grid therefore caused page-wide horizontal overflow; at 800px it extended into the right gutter even though it did not exceed the viewport. The original 834px layout fitted.

The only production change is two added lines in `client/src/styles.css`: a comment and a Reviewer-only `max-width:850px` media rule using `grid-template-columns:minmax(0,1fr)`. A two-column grid needs about 760/0.92 = 826.1px of viewport before allowing for a conventional scrollbar; 850px provides that allowance. The fix gives the content sufficient width by stacking it, rather than hiding overflow or shrinking essential controls. Wider layouts and Requester breakpoints are unchanged.

- Before: clean [ad7c7bf798b6dcc987b58e11c8bfe6a303c8375d](https://github.com/chaproi/club-expense-approval/commit/ad7c7bf798b6dcc987b58e11c8bfe6a303c8375d).
- Corrected, tested clean source: [34269152acdf4ebb06667516622b6fabd1e4a140](https://github.com/chaproi/club-expense-approval/commit/34269152acdf4ebb06667516622b6fabd1e4a140).
- No JSX, business-state code, existing tests, contracts, backend, dependency, schema, environment, timeout or retry changes.

## Actual rendered checks

The same [focused harness](check.mjs) exercised real Chromium, built React/Express and a newly created ownership-labelled PostgreSQL container. Before writing, it verified the `test_club_ui_` database prefix and exact live database/role/public-schema identity. The inherited [setup helper](../setup.cjs) supplied an isolated loopback target and random private credentials. No operational database or original environment file was used.

Two synthetic accounts and four 120-character request titles were used. The Reviewer display name is deliberately long. The initial requests were created through real authenticated APIs and remained SUBMITTED during the before check. Each width had its own request and was reported independently.

| Viewport | Before document scroll width | Before verdict | Corrected scroll width | Corrected verdict | Real decision after layout check |
|---|---:|---|---:|---|---|
| 761×1000 | 790px | FAIL: horizontal overflow | 761px | PASS | APPROVED |
| 768×1000 | 791px | FAIL: horizontal overflow | 768px | PASS | REJECTED |
| 800×1000 | 800px | PASS; grid still extends 24px into gutter | 800px | PASS | RETURNED |
| 834×1000 | 834px | PASS | 834px | PASS | APPROVED |

[Before measurements](before.json): four executed / two passed / two failed / zero skipped; exit 1 from actual geometry assertions, not setup or collection. [After measurements](after.json): four executed / four passed / zero failed / zero skipped; exit 0. All essential title/control boxes fitted in the corrected viewport; detail boxes now match their grid bounds. No page errors or idle transactions were observed.

At every width, Enter selected the exact request and retained `aria-current`; Tab/Shift+Tab traversed Approve, Rejection reason, Reject, Return reason and Return for correction with visible focus. Native scrolling brought each control into view. Both reason fields accepted representative long text. Reduced-motion checks passed at each width. All eight screenshots were visually inspected: text wraps, controls remain readable, and the corrected list/detail stack can be reached with ordinary vertical scrolling.

The after run also submitted one actual decision at each width, received HTTP 200, observed the rendered status, and independently read the authoritative detail: revision 1, exactly SUBMITTED plus the expected decision event, and unchanged title/amount. The screenshots were captured before those decisions; later width captures truthfully show preceding decisions in the list/summary.

## Commands and provenance

Commands ran sequentially from the UI checkout. The external command wrapper supplies the private owned test URL, records exit/signal/timing and redacts credentials; it does not change application budgets or assertions.

| Command | Source | Exit | Duration | Record |
|---|---|---:|---:|---|
| `npm.cmd run build` | ad7c7bf | 0 | 7.637 s | [baseline build](baseline-build.log), [command](baseline-build-command.json) |
| `npm.cmd run db:migrate` | ad7c7bf | 0 | 10.730 s | [command](migrate-command.json); all three existing migrations applied only to the verified new target |
| `node ../reviewer-breakpoints.mjs before` | ad7c7bf | 1 | 8.418 s | [output](before-render.log), [command](before-render-command.json) |
| `npm.cmd run build` | 3426915 | 0 | 6.212 s | [corrected build](corrected-build.log), [command](corrected-build-command.json) |
| `node ../reviewer-breakpoints.mjs after` | 3426915 | 0 | 7.381 s | [output](after-render.log), [command](after-render-command.json) |

The build includes TypeScript (`tsc --noEmit`, server compilation) and Vite production bundling. The corrected bundle has 29 modules and CSS 14.93 kB / 4.13 kB gzip. No application check failed after the stylesheet correction. Git's LF→CRLF warning is formatting normalization, not a test failure.

Both rendered commands used the identical retained harness, whose repository evidence filename is `check.mjs`; no business responses were mocked. UTC timestamps in the command/result JSONs correspond to 26 November 2026 at approximately 11:56–11:58 Asia/Bangkok. Environment: Windows NT 10.0.26200, Node 24.14.0, Chromium 151.0.7922.34, unchanged dependencies and PostgreSQL 17.12 container image. These checks cover Chromium viewport emulation, not every browser, device or assistive technology.

The earlier **47 API / 19 browser passes remain evidence at source 465ebea**, as documented in the [original verification record](../verification.md). They were not rerun or attributed to 3426915. This follow-up adds only build and four focused rendered cases; it does not claim a refreshed comprehensive regression or hosted CI result.

## Inspected screenshots

[screenshots.json](screenshots.json) contains independent byte lengths/digests. All eight files below were inspected at useful resolution and contain synthetic data only.

| Width | Before | Corrected |
|---|---|---|
| 761px | [Before](before-761.png) | [After](after-761.png) |
| 768px | [Before](before-768.png) | [After](after-768.png) |
| 800px | [Before](before-800.png) | [After](after-800.png) |
| 834px | [Before](before-834.png) | [After](after-834.png) |

## Cleanup and publication gate

[Independent cleanup](cleanup.json) verified 2 owned users / 5 sessions / 4 requests / 8 events before removal, then zero of each; no other client connection or idle transaction. After requests and clients drained, only the ownership-verified container and its anonymous volume were stopped/removed. Their absence and private runtime-file removal were checked; no owned Node/browser process remained. The existing stack, original checkout and historical evidence were preserved.

The fetched branch initially matched published ad7c7bf (ahead/behind 0/0). [PR #46](https://github.com/chaproi/club-expense-approval/pull/46) was still open and unmerged on the live preflight check. Its integration gate remains: wait for its reviewed merge, then incorporate latest staging and preserve its documentation before opening the UI PR. This correction does not merge, deploy or promote acceptance.

Evidence validation: 32 UTF-8 text files decoded strictly, 53 local links resolved, five Markdown tables validated, and all 17 screenshot byte lengths/digests matched (nine historical plus eight new). Harness syntax, whitespace, protected-path preservation and the two-line production scope passed.
