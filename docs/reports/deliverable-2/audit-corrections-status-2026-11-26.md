# Independent PDF audit corrections — completed PDF and interruption history

26November2026, Asia/Bangkok. Branch docs/d2-postdeploy-2026-11-26; starting local/published HEAD7b0194d24a3a7fcac6e52589bd0a176d8ff7aa5f. Assessed application remains cc6b04c8e98191be591a3b755d25988148523909. The resumed continuation completed the corrected77-page PDF and every-page QA. The earlier interrupted attempt is retained below, with its limitations attributed to that attempt rather than the finished output.

## Source changes prepared

| Finding | Current source correction | Final PDF pages |
|---|---|---|
| D2§3.1 register | AreaA consolidated eight-row register: DEF-TH038-01/02, Issue42, BF-01, Issue44, OBS-TH038-01/02, and separately pending/unapproved Lab7 with no invented historical ID. Source/requirement/decision/status/release/retest/owner/next-action or explicit deferral included. Original Lab6 peer retest remains scoped to43aa8d7. | 3–5 |
| Reproducible setup | AreaE native dev/bundled origin/port examples, separate test DB migration, Compose2.24.4+ isolated project/image/port/volume, ignored random-secret file, build/start/migrate/seed/HTTP URL/stop commands, normal tests and deployment procedure. Examples use explicit private placeholders; none executed. | 25–27 |
| Lab7 date | Current plan corrected fromBy30Nov toBy29Nov. Original baseline independently states Lab7 deadline29Nov. No extension/approval/completion invented; Lab7 remains separate from D2 acceptance. | 29; also disclosed in register on5 |
| AI tool names | Existing student-confirmed statement retained verbatim; factual supplemental sentence names ChatGPT and Codex and their assisted tasks. No new student confirmation claimed. | 29 |

## Resumed completion

Original course PDFs were successfully read with UTF-8 output, including D2§3.1 and reproducible setup requirements, Group Work§8.4 and the29November Lab7 schedule. The existing exporter generated the corrected77-page PDF; all77 page rasters were visually inspected. The current manifest/PDF/source hashes agree. Internal navigation resolves to A3/B6/C14/D15/E16;33 internal links have no invalid destinations. See [current QA and exact course-source hashes](pdf-audit-corrections-qa-2026-11-26.md). No application checks, live operations or new acceptance occurred.

## Historical interrupted attempt — checks actually completed

- Initial working tree/index clean; correct branch/HEAD/repository verified. Origin fetch succeeded; live docs SHA7b0194d and maincc6b04c matched. No branch switch/reset/clean or environment-file edit.
- No applicable AGENTS.md found in checkout/ancestor chain. Report source, packet README, assembler, renderer/exporter, original baseline and existing Lab6/defect/dependency evidence read. Assessed-release compose.yaml/.env.example/README read via git show; current identical package scripts/Dockerfile and deployment guide inspected. No app command, migration, seed or container startup executed.
- Located original course PDFs in Downloads/group_project_spec_files.zip and project_deliverable_2_v1.pdf. The latter is5pages, SHA2566c1372855c3600d75344adcfc9ce342f119e738f476420e00b5d127f6cc8581e. Initial extraction stopped at console UnicodeEncodeError. The UTF-8 follow-up read was not executed because automatic approval review could not complete after an account usage limit. Full original-course-PDF reading therefore remains incomplete; source edits use the user's precise§3.1/§8.4 requirements and repository baseline evidence, without claiming an independent completed PDF reread.
- `node docs/reports/deliverable-2/assemble.cjs`:exit0;12full documents,17inputs,3exact released-test excerpts,5original image copies. Old PDF hash no longer matches new report, so current manifest correctly has no PDF binding.
- `node docs/reports/deliverable-2/validate.cjs`:source-only PASS; UTF-8, links/anchors, Markdown tables, exact snippets/logs/input hashes, historical bodies and image bytes. No new PDF inspection claimed. Scanner allowlists only the two exact documented private-placeholder URLs and still rejects other credential-bearing strings.
- `git diff --check`:PASS; existing autocrlf LF/CRLF notices only. No original evidence log/image, production/test/dependency/schema/CI/environment changes.

## Historical blocker and then-required next action — resolved in resumed continuation

Automatic approval review returned an account usage-limit error for the follow-up course-PDF read. It expressly stated that the action was not executed and that this was a review failure, not an unsafe-action determination. No retry or alternative bypass was attempted. The existing PDF tools and authenticated publication path require that approval availability; rendering, full-page QA, final page mapping, commit/push remain pending. No commit was made because the user requires successful completed documentation/PDF checks before publication.

Once approval availability is restored: finish reading the original course PDFs, run the existing PDF pipeline, inspect every resulting page, validate all four fixes and internal destinations, update current QA/checklist/README, inspect/stage only the scoped documentation changes, commit and push normally. Preserve the prior PDF in Git history and all original logs/failed attempts. Final acceptance/submission remain owner decisions; no new external UAT gate.
