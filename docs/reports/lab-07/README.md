# Lab7 report packet

Release assessed: **c259afe45eb49311c1f7bb9e166c4443041b9b82**. Identity: นายสิริกร ฝันนิมิตร /67070507215 /TH-038, solo with instructor permission. Date28November2026 (Asia/Bangkok); original due29November23:59 unchanged. Instructor announcement supersedes only the original approval prerequisite.

- [Final PDF](output/pdf/club-expense-approval-lab7.pdf):30 A4 pages.
- [Self-contained source](report.md), [actual page map](pages.json), [font/geometry/visual QA](pdf-qa.json), [layout checks](layout-check.json), [artifact manifest](manifest.json), [validation](validation.json).
- [Post-release identity, all attempts, live results and cleanup](../../labs/lab-07/postdeploy-2026-11-28/README.md).

| Part | Weight | Actual PDF pages | Content |
|---|---|---|---|
| A |25|2-8|Old/new rule, supplied announcement, impact, relevant SRS/SDS, full8AC/10STS and pre-code review|
| B |50|9-23|RED/GREEN, actual bounded diff/SQL, preservation, reviews, exact-main CI/deployment, live cases/screens/inventory/failure|
| C |15|24-26|Five dated metrics, offline-reconcilable lists and <=100-word interpretation|
| D |10|27-30|Scoped readiness, version-specific defect/debt register, runbook, three engineering conclusions, contribution/AI/limits|

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

The first26-page draft exposed two content overflows and was split instead of shrinking fonts. Table/prose boundaries, actual unit/RED excerpts and nonadjacent UI excerpts were corrected. The authenticated live evidence added two screenshot pages, yielding30 pages. An authoring script initially used Windows cp874 implicitly; rerunning with explicit UTF-8 corrected that documentation-only decoding error. No application failure or live result was reclassified. Final30 pages were individually inspected for readable code/tables/screenshots, Thai identity, captions, page numbers and clipping.

Nine PDF links include four actual A-D destinations plus five source URLs. Local relative links are checked; source hashes and exact GitHub identities preserve provenance. Direct-cloud/SQL observations and pre-deployment snapshots remain unavailable, inherited Low/dependency limitations remain, and owner acceptance/submission is not performed. Original Lab6 UAT applies only to its original43aa8d7 retest; our live checks are owner-directed automation.
