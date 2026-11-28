# Lab7 report-only correction and QA ledger

Date28November2026 Asia/Bangkok. Branch docs/lab7-postdeploy-2026-11-28; fetched starting local/upstream ba14511 matched. Preflight found only the generated PDF missing; the explicit regeneration request restores that output. All unrelated work/environment files/D2 artifacts retained. Deployed application main c259afe is unchanged.

## Actual changes and final mapping

| Finding | Correction / actual final page |
|---|---|
| Contents lacked evidence IDs | Page1 adds13 existing IDs with linked sections/ranges; A2-10/B11-28/C29-31/D32-35, weights25/50/15/10. See evidence-index.json. |
| Student rationale omitted | Page3 quotes the original c7f1c88 proposal section2 and labels the author explanation separately. No new stakeholder/financial approval. |
| Reviews only summarized | Pages10/20/22 quote actual PR50/51/52 decisions/guidance/non-blocking notes, full reviewed SHA/reviewer/original UTC and separate author dispositions. Preserved bodies match authenticated GitHub read-only records exactly. No review was requested or submitted. |
| Same-suite GREEN output missing | Page13 embeds actual retained unit-1 command/output at clean ec10dd4:34 executed/pass,0fail/skip,226.2607ms runner,289ms process,exit0. Page12 retains original RED. No test rerun. |

## Commands and validation - documentation only

- `git status`, branch/HEAD/upstream checks and `git fetch origin`: expected branch/HEAD, no advance. Read original c7f1c88 proposal using `git show`; read original retained GREEN log/ledger.
- Read-only GitHub PR50/51/52 review endpoints: preserved body, reviewer, commit, submitted timestamp and APPROVED state matched. Corroboration JSON retained; no metadata writes.
- `python .../collect-corrections.py <repo-root>`: first attempt exposed a Markdown-row parser index error; corrected delimiter handling. Final extraction verifies every selected quotation is an exact substring of its original source.
- Existing assembler -> Chromium renderer -> PDF QA pipeline:35 pages, no content overflow. First font audit identified synthetic Type3 fonts on bold inline-code path spans; regular embedded Mono rendering removed that fallback. Quoted words are unchanged. No font/glyph/page-boundary issue remains.
- Offline validator: exact review source/PDF word matching, original GREEN-log hash/quoted output, original rationale, full8AC/10STS, all13 evidence IDs,17 internal destinations,25 links total and70-word interpretation. Source metrics, review bodies, live results and the first failure remain unchanged from ba14511.
- Final35 pages individually rendered/visually inspected for Thai identity, readable tables/code/logs/screens, captions/navigation and clipping. Actual fonts and per-page raster hashes are in pdf-qa.json; layout bounds in layout-check.json.
- UTF-8, local links, source/PDF hashes, secret-pattern checks, full/staged scope and `git diff --cached --check` verified before publication. Git's existing Windows LF/CRLF warnings are not content changes; no repository line-ending configuration was changed.

No application source, test, dependency, migration or workflow edit; no application suites/live checks/deploy/PR/merge/Issue closure/submission. The fixed metrics window/values and interpretation text are preserved. Instructor-announcement waiver, original failures and direct-cloud/revision-digest/pre-deployment preservation limitations remain unchanged. F-06 totals/F-07/F-08 remain Planned. No unresolved gap in these four documentation corrections; earlier operational evidence limitations and owner acceptance remain separate.
