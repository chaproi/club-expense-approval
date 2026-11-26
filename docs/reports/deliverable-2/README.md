# Deliverable 2 report-ready source packet

Released application: **cc6b04c8e98191be591a3b755d25988148523909**, 26 November 2026. This folder is a documentation source packet, **not a submitted/final-accepted PDF**.

Start with [report.md](report.md). It is a single assembled report with the actual rubric A(5), B(25), C(15), D(10), E(15), full required source documents, per-AC completion, two exact automated test excerpts, two substantive engineering chains, deployment/live evidence, setup and dated Final plan. Its five selected deployed images are local in assets/; the core report can be exported without downloading remote content. External links are optional audit drill-through, not substitutes for the embedded required text.

- [report-source.md](report-source.md): editable narrative and explicit student-text placeholders.
- [assemble.cjs](assemble.cjs): documentation-only Node24 assembler; no package installation, app server, database or tests.
- [manifest.json](manifest.json): canonical UTF-8/LF input digests, twelve complete embedded documents, released test excerpt line ranges/hashes and five image digests.
- [validation.md](validation.md): actual documentation checks, scope and remaining PDF work.
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

The assembler checks that the two excerpt sources still match released main, inserts the completion/status documents, includes twelve full documents, copies the already-inspected images and updates the manifest. It does not run or claim new application verification. Do not edit generated report.md directly; edit its narrative/source documents and reassemble.

The appendix input manifests preserve canonical UTF-8/LF source-file digests. Relative appendix links are mapped to complete in-report sections or pinned evidence at documentation parent802a111. Historical wording is not relabelled as a present Pending gate; current summaries identify superseded checkpoints.

## Concrete material still needed for the final PDF

1. Student's full name/cover confirmation; baseline identifies chaproi / ID67070507215 and solo instructor-approved status, but the full-name field is deliberately not guessed.
2. Student-authored personal reflection and contribution/AI-use statement, based on actual work. The report contains prompts/placeholders, not fabricated personal prose.
3. Owner's final D2 acceptance/date and submission action/receipt. These cannot be inferred from passing technical checks.
4. Export the completed report with a Markdown-to-PDF tool that supports UTF-8 Thai text, GFM tables, code blocks and local PNGs. Then visually inspect every PDF page for wrapping/table splits, font fallback, code readability, captions, links and page numbering; confirm the course's required filename/identity details. **No final PDF was produced or visually certified in this documentation batch.**

No additional external peer acceptance is required for D2. Existing Lab6 archive/course-PDF/reciprocal handoff material belongs to that separate obligation; its original independent acceptance is not reopened. Direct-cloud revision/task reads and an exact pre-release shared snapshot are disclosed limitations, not invented PASS results or silently added mandatory gates.

The deployed screenshots contain explicit grey/magenta privacy masks over unrelated request-list data. Their capture timestamps, selected IDs/revisions and original failed capture attempt remain in the published evidence. Do not remove masks or relabel them as captures of this documentation commit.

F-06 totals, F-07 and F-08 remain planned. No redeployment, live-data edit, new suite execution, main merge, issue closure or final submission is authorized by assembling this packet.
