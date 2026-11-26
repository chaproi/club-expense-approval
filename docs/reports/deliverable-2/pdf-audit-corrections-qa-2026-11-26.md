# Corrected Deliverable 2 PDF — audit correction QA

26 November 2026, Asia/Bangkok. Documentation branch: `docs/d2-postdeploy-2026-11-26`; parent: `7b0194d24a3a7fcac6e52589bd0a176d8ff7aa5f`. Assessed/deployed application remains **cc6b04c8e98191be591a3b755d25988148523909**. This is documentation QA, not a new application execution, student acceptance, independent peer approval or submission.

The [corrected PDF](output/pdf/club-expense-approval-d2.pdf) is **77 A4 pages / 1,760,262 bytes**. PDF SHA-256: `ddfb35c5772e1cd217f1188b36d7512ff880cfc8553c4068b1e798a104e9b226`. Report SHA-256: `2a61d0726fb77f866e7e092cfa74437002feb0eb24c3ffc05ec3a55558dfc64f`. [Manifest](manifest.json) and [machine-readable QA](pdf-validation.json) bind those exact bytes. The [previous72-page result](pdf-qa-2026-11-26.md) and [interrupted correction attempt](audit-corrections-status-2026-11-26.md) remain historical evidence.

## Course specification verification

The original locally supplied PDFs were read, without changing them or adding private archives to Git:

| Original source | Verified requirement | SHA-256 |
|---|---|---|
| `project_deliverable_2_v1.pdf`,5pages | Page2§3.1 register fields; page5 reproducible dependencies/environment/build/run/test/migration/seed/deployment instructions and two actual test excerpts; full documents and PDF navigation | `6c1372855c3600d75344adcfc9ce342f119e738f476420e00b5d127f6cc8581e` |
| `group_work_specs_v1.pdf`,15pages, within the supplied course archive | Pages2–3 schedule: Lab7 due29November23:59; page11§8.4 tool names/tasks; page14 separately approved Lab7 maintenance scope | `ec2476f85df139cab5bd78b937364149baf5b16f5f16adb2a27e1030451cda6b` |

The earlier console UnicodeEncodeError and unavailable automatic approval review remain recorded in the interruption ledger. The resumed UTF-8 read succeeded. No extension, instructor approval, completed maintenance or new D2 acceptance gate was invented.

## Four corrections in the actual PDF

| Audit finding | Final PDF pages | Actual included content |
|---|---:|---|
| Complete change/defect register | 3–5 | Eight rows: both original Lab6 defects, Issue42, BF-01, Issue44, two accepted unresolved Low observations and separately pending/unapproved Lab7. IDs/source, affected rules, decision, resolved/remaining state, release/retest, owner and next action/deferral. No fabricated historical Lab7 ID; original Lab6 retest remains scoped to43aa8d7. |
| Reproducible setup | 25–27 | Dependencies; native dev/bundled origin and port; distinct local dev/test database roles/URLs with private placeholders; isolated Compose project/image/port/volume; ignored secret generation; build/start/migrate/seed/URL/stop; existing test and concise deployment commands. Read against assessed-release compose.yaml/.env.example/README/scripts/Dockerfile/deployment guide. Instructions were documented, not executed again. |
| Lab7 deadline | 29; related register disclosure on5 |29November instead of30November; no extension/approval/completion claimed. Lab7 remains a separate course obligation rather than a new D2 prerequisite. |
| Named AI tools | 29 | ChatGPT and Codex with factual assisted tasks. Student-confirmed concise contribution statement remains unchanged. Supplement does not assert a new student confirmation or AI-performed independent UAT. |

Actual cover navigation: **A3 / B6 / C14 / D15 / E16**. Required test excerpts are on11–12; additional BF-01 excerpt is on13. Complete source appendices occupy32–77, after their divider on31. The owner decision line on30 and short appendix-ending pages are intentional chapter pagination, not blank body pages.

## Commands and document checks actually performed

| Command / activity | Outcome |
|---|---|
| Repository/branch/HEAD/status inspection; `git fetch origin`; live docs/main SHA read | Succeeded. Starting docs HEAD7b0194d; deployed maincc6b04c unchanged. Existing pending documentation preserved. |
| UTF-8 read of original course PDFs through isolated PyMuPDF | Succeeded on resumed continuation; hashes and requirements above. |
| `node docs/reports/deliverable-2/assemble.cjs` | Exit0;12complete documents,17inputs,3exact released test excerpts,2verbatim log excerpts and5unchanged image copies. |
| `python docs/reports/deliverable-2/export-pdf.py --python-tools <owned-tools> --playwright <existing-module> --qa-dir <owned-external-render-directory>` | One successful corrected-source export, exit0; two local-HTML prints calculate/confirm navigation;77pages;0HTML overflow elements and0structural/glyph/bounds issues. |
| Read-only page/link probe | Initial probe printed correct correction-page references and named destinations, then exit1 because a local `p` variable had been shadowed by a Page before `.stat()`. Corrected probe exit0; PDF bytes unchanged. This was a document diagnostic error, not an application or PDF-content failure. |
| Visual review | All77final1.5× rasters inspected in39numbered two-page sheets;58and67also individually inspected to confirm apparent sheet-display trimming did not occur in the PDF. No observed clipped text, overlapping content, missing Thai glyphs or split table rows. Code, captions, page numbers and all screenshot panels checked. |
| PDF destination checks |33internal links,97URI links,11named destinations,115outline entries;0invalid internal destinations. Both GoTo and named destinations checked. Cover destinations match actual section starts. Historical remote HTTP availability was not retested. |
| Syntax, consistency, UTF-8, local links, Markdown tables, required excerpt/log/source digests, image preservation and secret-pattern validation | Run with documentation-only scripts; final machine counts retained below. No application test/build, migration, seed, benchmark or deployment executed. |

Tools: Windows host; Node24.14.0; Python3.13.6; markdown-it-py4.3.0; PyMuPDF2.2/MuPDF1.28.6; existing Playwright1.62.1/Chromium151.0.7922.34. Five embedded font subsets contain data: Tahoma regular/bold, Consolas, ArialMT and SegoeUISymbol. Raw font files are not redistributed. Thai cover identity and Thai full-document appendices render correctly.

Final documentation validation: PASS;31UTF-8 text files/23Markdown files across the cumulative documentation packet,152local link occurrences,77Markdown tables/760rows,83pinned link occurrences/46distinct pinned Git objects,12historical bodies preserved,16Sprint2 AC rows,8FR/10BR/2NFR,17manifest inputs,12full appendices,3released excerpts and5unchanged image copies;0secret-pattern findings. These are documentation counts against the validator's original baseline, not this correction's changed-file count or application test totals. Three Node script syntax checks and Python AST syntax check all exited0. Working/staged whitespace checks passed; normal LF-to-CRLF Git notices remain.

The first byte-for-byte repeatability check after export stopped at a manifest.json mismatch when the assembler rewrote the exporter-written JSON. It is retained as a failed documentation probe. A subsequent canonical reassembly passed unchanged report/manifest/PDF hashes, followed by the complete validator PASS above. The inspected PDF and report hashes did not change; no new PDF render or application execution was needed.

## Preservation, cleanup and remaining decisions

No original log, screenshot, historical source document, application/test file, manifest/lockfile, schema/migration, CI/cloud configuration or environment file changed. The generated report, PDF and manifest are current outputs; their older bytes remain in Git history. Five original PNG assets remain byte-for-byte equal to their sources. Full required baseline/SRS/inventory/System SDS/traceability and all five feature contracts are still embedded.

The exporter uses local HTML only and closes its headless browsers in `finally`. Independent process inspection found0owned active exporter/render processes; no application listener/database/session is created by this batch. An initial elevated protected-path comparison did not enter the intended Git worktree and printed usage; the corrected comparison in the verified owning worktree exited0 with no protected-path differences. Rendered page PNGs and isolated documentation tools remain outside Git. Existing previews/worktrees/environment files are preserved.

F-06 totals, F-07 and F-08 remain Planned. Original Lab6 independent UAT/retest retains its version/author attribution. Direct-cloud current revision/task reads and exact pre-release shared-data snapshot limitations remain disclosed. No new technical or external-UAT release gate was added. No missing personal field remains; the owner still decides final acceptance/date, course filename and submission.
