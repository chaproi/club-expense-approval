# Campus UI: reviewed staging integration — 26 November 2026

## Preflight and prerequisite

Repository: chaproi/club-expense-approval. Branch: `feat/sprint2-campus-ui`. The checkout was clean at the expected published [6702889f4a585e3cd8702dcbb102712ea1d97a36](https://github.com/chaproi/club-expense-approval/commit/6702889f4a585e3cd8702dcbb102712ea1d97a36); local/upstream ahead/behind was 0/0. No applicable AGENTS.md was present in its ancestor chain or fetched tree. README, current reviewer handoff, existing UI verification and the unchanged CI workflow were read. No preview process was stopped, and no environment file was changed.

A successful live fetch found `origin/staging/sprint-2` exactly at [c898889b035f5f5b4e1e94bea511376916d3ae84](https://github.com/chaproi/club-expense-approval/commit/c898889b035f5f5b4e1e94bea511376916d3ae84), with no newer remote commits.

[PR #46](https://github.com/chaproi/club-expense-approval/pull/46) was **approved and merged**:

- Independent reviewer: thananun-7203.
- [Approval](https://github.com/chaproi/club-expense-approval/pull/46#pullrequestreview-6069929119): 2026-11-26T07:16:10Z, applying to final head `dd00cac616d0dae30bd89f2ca419a22518bfc8f5`.
- Merge into staging: 2026-11-26T07:17:10Z (14:17:10 Asia/Bangkok), merge SHA c898889 above.
- The approval explicitly covers documentation/integration evidence, not main release, deployment or submission acceptance.

## Normal merge and scope

Executed `git merge --no-ff origin/staging/sprint-2 -m "Merge reviewed Sprint 2 documentation into campus UI branch"`.

Integrated merge HEAD: [056f9bc7cc72002f0e2ac262343edbae0beca9b1](https://github.com/chaproi/club-expense-approval/commit/056f9bc7cc72002f0e2ac262343edbae0beca9b1). Parents are 6702889 and c898889. The merge completed without conflicts; containment of c898889 was verified.

The incoming changes are exactly nine reviewed documentation/evidence files: five files under `docs/evidence/deliverable-2/integration-2026-11-26/`, plus `docs/features.md`, `docs/reviewer-handoff.md`, `docs/sprints/deliverable-2.md` and `docs/traceability.md`. Their bytes match fetched staging. The reviewed Project Deliverable 2 rubric and pending release/deployment gates were preserved.

The application, tests, Prisma/schema/migrations, packages/lockfile, Docker/Compose, workflows and TypeScript/Vite/Playwright configuration are byte-identical between pre-merge UI head 6702889 and merge HEAD 056f9bc. No new local application execution was necessary for this documentation-only integration.

Against staging, the production diff remains limited to four presentation paths:

- `client/src/main.tsx`: original campus login/account shell, artwork, focus/skip link and presentation.
- `client/src/expense-requests.tsx`: existing workflow rendered as request cards, detail/history and distinct saved/draft/conflict surfaces.
- `client/src/styles.css`: responsive layout, focus/motion and Reviewer breakpoint correction.
- `client/src/assets/campus.svg`: original local decorative artwork.

All other branch additions are UI documentation, redacted logs, observation harnesses and synthetic screenshots under `docs/evidence/ui-redesign/`. Existing tests, backend, business-state functions, API/contracts, schema, dependencies and workflow configuration are unchanged. The ten inherited function bodies before their render returns again compared equal using [verify-logic.cjs](verify-logic.cjs). No filtering, approval stage, new financial metric or dependency was added.

## Verification provenance retained

| Evidence | Actual tested source | Scope/result |
|---|---|---|
| [Full local verification](verification.md), [commands](commands.json) | `465ebea693c5cebe6e6ebeb4460f8e2d79162d3b` | TypeScript/build PASS; 47/47 unit/API and 19/19 complete existing browser cases PASS, zero failed/skipped |
| [Reviewer breakpoint correction](reviewer-breakpoints/verification.md) | `34269152acdf4ebb06667516622b6fabd1e4a140` | Build PASS; four focused real rendered cases at 761/768/800/834px PASS, real decisions, selection, keyboard/focus and reduced motion |
| This documentation-only normal merge | `056f9bc7cc72002f0e2ac262343edbae0beca9b1` | Containment, exact byte comparisons, unchanged state-function checks and full diff/whitespace review; no application-suite execution claimed |
| Forthcoming UI publication commit / PR head | Record from GitHub when published | Additional UI documentation only; hosted verify must be inspected separately on the actual PR head/its merge test revision |

Earlier failed observations, initial 761/768 overflow, local setup/recorder limitations and all screenshots retain their original provenance. No earlier execution is relabelled as a run on the merge/publication head.

## Peer-review package and limits

See [visual direction](design.md), [asset provenance](assets.md), [original before/after screenshots](verification.md#beforeafter-screenshots) and [four-width before/after evidence](reviewer-breakpoints/verification.md#inspected-screenshots).

Local evidence covers Chromium, desktop/mobile/tablet emulation, visible keyboard focus, native control traversal/selection/skip link, genuine workflow data, controlled transport failure/recovery, pending feedback, reduced-motion suppression and a 20-event history. Representative text contrast was sampled; cross-browser, physical-device, screen-reader and full WCAG certification are not claimed. A controlled transport abort is not a naturally occurring outage. The scoped Prisma config override limitations remain as documented by the reviewed dependency work.

The PR #46 integration prerequisite is now satisfied. The campus UI is ready to be presented for **independent peer review**, not accepted, merged or deployed. The PR body must use commit-pinned evidence links, distinguish local results from hosted CI, and report current check outcomes accurately. CI was not yet triggered when this record was prepared; its eventual run/verify job and exact tested revision will be reported on the published PR. Main release, deployment and issue/Deliverable acceptance remain separate gates.

Publication-document checks: 33 UTF-8 text files, 63 local links and six Markdown tables validated; all 17 historical screenshot byte lengths/digests matched. Full/staged diff whitespace, protected-path equality and the ten unchanged state-function checks passed. These are documentation/scope checks, not rerun application tests.
