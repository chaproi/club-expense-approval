# Lab7 report packet

Release assessed: **c259afe45eb49311c1f7bb9e166c4443041b9b82**. Identity: นายสิริกร ฝันนิมิตร /67070507215 /TH-038, solo with instructor permission. Date28November2026 (Asia/Bangkok); original due29November23:59 unchanged. Instructor announcement supersedes only the original approval prerequisite.

- [Final PDF](output/pdf/club-expense-approval-lab7.pdf):35 A4 pages.
- [Self-contained source](report.md), [actual page map](pages.json), [font/geometry/visual QA](pdf-qa.json), [layout checks](layout-check.json), [artifact manifest](manifest.json), [validation](validation.json).
- [Post-release identity, all attempts, live results and cleanup](../../labs/lab-07/postdeploy-2026-11-28/README.md).

| Part | Weight | Actual PDF pages | Content |
|---|---|---|---|
| A |25|2-10|Old/new rule, supplied announcement, impact, relevant SRS/SDS, full8AC/10STS and pre-code review|
| B |50|11-28|RED/GREEN, actual bounded diff/SQL, preservation, reviews, exact-main CI/deployment, live cases/screens/inventory/failure|
| C |15|29-31|Five dated metrics, offline-reconcilable lists and <=100-word interpretation|
| D |10|32-35|Scoped readiness, version-specific defect/debt register, runbook, three engineering conclusions, contribution/AI/limits|

## Offline regeneration

Use Python3 with PyMuPDF (`pymupdf`), markdown-it-py and fonttools, plus existing Playwright/Chromium. No application suites, live reads or live writes are needed. Windows Tahoma regular/bold and Consolas are embedded/subset into the PDF by Chromium; original font files are not redistributed. The original seven-page course specification was read separately; its hash is recorded in the report. Do not modify the completed D2 pipeline.

```powershell
$env:PYTHONUTF8='1'
$env:PYTHONIOENCODING='utf-8'
# All paths below are local paths; no credentials are needed.
python docs/reports/lab-07/scripts/assemble-packet.py <repo-root> <owned-temp-output> <python-tool-module-directory> <playwright-module-directory>
node docs/reports/lab-07/scripts/render-packet.cjs <owned-temp-output>/report-print.html docs/reports/lab-07/output/pdf/club-expense-approval-lab7.pdf <playwright-module-directory> <owned-temp-output>
python docs/reports/lab-07/scripts/qa-pdf.py <repo-root> <owned-temp-output>/pages <python-tool-module-directory>
python docs/reports/lab-07/scripts/validate-packet.py <repo-root> <python-tool-module-directory>
```

The assembler reads committed exact-main evidence and actual released source/git diff, not future business results. Renderer checks each explicit sheet for content overflow before printing. QA renders every page and checks glyphs/fonts/bounds. Its initial visual status is Pending by design: **visually inspect every newly generated final page**, then record the actual reviewed hash/pages. Regeneration changes the PDF hash; update the manifest/QA only after inspection. Static counts/pages are assertions to detect unintended drift, not predeclared application outcomes.

## QA and attempt provenance

The first26-page draft exposed two content overflows and was split instead of shrinking fonts. Table/prose boundaries, actual unit/RED excerpts and nonadjacent UI excerpts were corrected. The authenticated live evidence added two screenshot pages, yielding30 pages. An authoring script initially used Windows cp874 implicitly; rerunning with explicit UTF-8 corrected that documentation-only decoding error. No application failure or live result was reclassified. The initial publication's30 pages were individually inspected for readable code/tables/screenshots, Thai identity, captions, page numbers and clipping.

The corrected PDF has25 links:17 actual A-D/evidence-ID destinations and8 source URLs. Local relative links are checked; source hashes and exact GitHub identities preserve provenance. Direct-cloud/SQL observations and pre-deployment snapshots remain unavailable, inherited Low/dependency limitations remain, and owner acceptance/submission is not performed. Original Lab6 UAT applies only to its original43aa8d7 retest; our live checks are owner-directed automation.

## Four documentation corrections, 28 November2026

Starting branch/head: docs/lab7-postdeploy-2026-11-28 at ba14511a728c0afc55a44d293629adde84ad0126, matching fetched upstream. The generated PDF was locally absent at preflight; it was regenerated at the requested path. No other pending changes were overwritten. Assessed/deployed main remains c259afe.

| Correction | Final PDF pages | Existing evidence IDs / source |
|---|---|---|
| Contents/evidence IDs |1|13 existing L7-A1-A3/B1-B5/C1-C2/D1-D3 identifiers linked to actual sections; A/B/C/D25/50/15/10|
| Original student-proposed rationale |3|Reviewed c7f1c88 proposal.md section2, quoted verbatim and separated from author explanation|
| Actual submitted peer review excerpts |10,20,22|PR50 contract / PR51 implementation / PR52 release; reviewer, exact SHA, original UTC, approval, guidance/non-blocking notes and author disposition|
| Matched expense-input RED/GREEN |12-13|Original RED retained; actual ec10dd4 GREEN unit-1 output34/34,0failed/skipped,226.2607ms runner and289ms process|

[Evidence-ID index](evidence-index.json), [exact extracted source material and hashes](correction-evidence.json), [read-only GitHub corroboration](review-corroboration-2026-11-28.json) and [correction/QA ledger](corrections-2026-11-28.md). All35 final rendered pages were individually inspected after regeneration. Quotation matching checks exact source substrings and normalized rendered words (Markdown quotation prefixes and PDF line wrapping are presentation). The PDF uses embedded Tahoma, Tahoma Bold, Consolas and SegoeUISymbol; bold inline code is printed in the actual regular embedded Mono face to avoid synthetic Type3 fallback, without changing quoted words.

To refresh only the extracted report evidence offline, run `python docs/reports/lab-07/scripts/collect-corrections.py <repo-root>` before the existing assembler/render/QA process. This command reads original Git/docs/logs and does not execute tests. The source GREEN log, fixed metrics window/values/70-word interpretation, failed-attempt records and screenshots are unchanged. No application suite/live check/deployment ran in this correction batch. Historical QA and original30-page packet remain in commit ba14511; no new acceptance/submission is claimed.
