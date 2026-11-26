# Deliverable 2 report-ready source packet

Released application: **cc6b04c8e98191be591a3b755d25988148523909**, 26 November 2026. This folder is a documentation source packet, **not a submitted/final-accepted PDF**.

**Audit corrections completed after7b0194d:** the regenerated77-page PDF contains all four corrections and has been visually inspected page by page. See [correction status and preserved interruption history](audit-corrections-status-2026-11-26.md) and [current PDF QA](pdf-audit-corrections-qa-2026-11-26.md). The manifest binds the corrected source to the inspected PDF; the previously published72-page version remains in Git history.

Open the [77-page report PDF](output/pdf/club-expense-approval-d2.pdf), or edit [report.md](report.md) through its source below. It includes the actual rubric A(5), B(25), C(15), D(10), E(15), full required documents, per-AC completion, the required domain/concurrency and backend-access excerpts plus additional BF-01 coverage, verified engineering chains, verbatim logs, deployed demonstrations, executable local setup and dated Final plan. The consolidated change/defect register is on pages3–5; setup is on25–27; the29November Lab7 deadline and named AI tools are on29. Five original images remain local in assets/. External links are audit drill-through, not substitutes for embedded required text.

- [report-source.md](report-source.md): editable narrative with student-confirmed Thai name, ID/team and concise contribution/AI-use declaration. A long reflection is optional.
- [assemble.cjs](assemble.cjs): documentation-only Node24 assembler; no package installation, app server, database or tests.
- [manifest.json](manifest.json): canonical UTF-8/LF input digests, twelve complete embedded documents, released test excerpt line ranges/hashes and five image digests.
- [validation.md](validation.md): original source-only checks at7b62e8f, preserved as a historical checkpoint.
- [pdf-audit-corrections-qa-2026-11-26.md](pdf-audit-corrections-qa-2026-11-26.md) and [pdf-validation.json](pdf-validation.json): current77-page checks, page inspection, actual navigation pages, hashes and embedded fonts. [Original72-page QA](pdf-qa-2026-11-26.md) retains its historical version-specific results.
- [review-chains-2026-11-26.json](review-chains-2026-11-26.json): read-only GitHub metadata/reviews for both selected fixes and main release.
- [validate.cjs](validate.cjs): repeatable structural/source validation without application execution.
- [Current per-AC checklist](../../sprints/d2-completion-2026-11-26.md).
- [Owner-directed deployed verification](../../evidence/deliverable-2/postdeploy-2026-11-26/evidence.md).
- [Lab6 historical independent UAT/retest](../../labs/lab-06/retest-status-2026-11-26.md), separate from D2.

## Reassemble after edits

From the repository root:

~~~powershell
node docs/reports/deliverable-2/assemble.cjs
node docs/reports/deliverable-2/validate.cjs
~~~

The assembler checks all three excerpt sources against released main, embeds two verbatim log excerpts and verified review metadata, inserts twelve full documents and copies existing images. It does not run application checks. Edit source documents, not generated report.md. If the report hash changes, regenerate the PDF and repeat visual inspection before publication; a prior PDF hash cannot certify new source.

The manifest uses canonical UTF-8/LF source digests. Relative appendix links map to complete in-report sections or evidence pinned at documentation parent7b0194d. Historical wording is not relabelled as a present gate; current summaries identify superseded checkpoints.

## Reproduce the PDF without changing application dependencies

Use a separate documentation-tools directory containing markdown-it-py4.3.0, PyMuPDF2.2, fonttools4.69.1 and Pillow, plus an existing Playwright1.62.1/Chromium installation. No root package or lockfile change is needed. Windows Tahoma regular/bold and Consolas are read locally and embedded as PDF subsets; raw font files are not redistributed. The exact prepared PDF is included, so regeneration is optional.

~~~powershell
python docs/reports/deliverable-2/export-pdf.py --python-tools <owned-python-tools-directory> --playwright <existing-playwright-module-directory> --qa-dir <owned-external-render-directory>
node docs/reports/deliverable-2/validate.cjs
~~~

The export prints local HTML twice to calculate and confirm actual A–E page references. It embeds fonts/images, records PDF/source hashes and renders every page to PNG in the owned QA directory. Inspect every final page; automated text/glyph/bounds checks alone do not establish visual quality. Labelled print crops omit the long privacy-masked middle of tall screenshots; original PNG bytes remain intact.

## Owner's remaining decisions

The student confirmed นายสิริกร ฝันนิมิตร, ID67070507215, TH-038 Solo instructor-approved and the concise declaration on26Nov2026. No personal fields are unresolved. Owner final acceptance/date and submission action/receipt remain unrecorded; confirm any course-required final filename before submission. These decisions cannot be inferred from passing technical checks or this PDF export.

No additional external peer acceptance is required for D2. Existing Lab6 archive/course-PDF/reciprocal handoff material belongs to that separate obligation; its original independent acceptance is not reopened. Direct-cloud revision/task reads and an exact pre-release shared snapshot are disclosed limitations, not invented PASS results or silently added mandatory gates.

The deployed screenshots contain explicit grey/magenta privacy masks over unrelated request-list data. Their capture timestamps, selected IDs/revisions and original failed capture attempt remain in the published evidence. Do not remove masks or relabel them as captures of this documentation commit.

F-06 totals, F-07 and F-08 remain planned. No redeployment, live-data edit, new suite execution, main merge, issue closure or final submission is authorized by assembling this packet.
