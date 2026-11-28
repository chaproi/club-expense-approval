# Lab 7 category-policy documentation revision

27 November 2026, Asia/Bangkok. Same [Issue49](https://github.com/chaproi/club-expense-approval/issues/49) / [PR50](https://github.com/chaproi/club-expense-approval/pull/50), branch `docs/lab7-amount-limit-proposal`, starting published HEAD **12d40ecf571d50a012045b324d48ae50459c21eb**. Documentation only. Implementation, migrations, automated tests and all RED/GREEN executions remain UNEXECUTED.

## 1. Prospective change and provenance

The student supplied the [announcement quoted verbatim](instructor-announcement-2026-11-27.md). Instructor/TA approval is now **Not required under updated instructor announcement**, not Approved. Original publication date/URL and personal approval are not supplied or invented.27November is this repository's receipt/recording date only. **Substantive independent peer review of the revised contract before implementation remains PENDING.**

The student replaces the original uniform150000 proposal with ACTIVITY1–150000, EQUIPMENT1–120000, TRAVEL1–100000, for creation and owner-authorized RETURNED edits. The announcement is not evidence that the instructor chose these values or accepted their complexity. The peer must assess the concrete category/amount dependency, no-clamp category changes, recovery interaction and API/UI/SQL/data design.

Original12d40ec and all original documents remain in Git history. The [historical preparation record](preparation-validation-2026-11-27.md) retains its old body with a current supersession notice. [Pre-revision GitHub snapshot](history/12d40ec-issue-pr-snapshot.json) preserves exact original Issue/PR titles/bodies, source identities and actual review inventory before the current summaries change. At retrieval there were0submitted reviews; no review is fabricated or erased. Existing comments, review submissions, original commits and CI records are not overwritten by editing current summaries.

## 2. Scope and review package

| Area | Current proposed change | Preserved / future proof |
|---|---|---|
| Current requirement and impact | Category-dependent policy and actual parser callers | Same BR-01/F-02/F-05 identities; no claim old rule was defective; old baseline/pre-change source retained |
| Server and two forms | Validate category/amount together; dynamic max/feedback; no invalid API write | No clamp/reset/auto-save; no role/Origin/status/revision/history or explicit Save/Resubmit change |
| Draft recovery | Restored changed amount may be invalid under latest untouched category | Retain draft/user intent; visible feedback, explicit valid correction/manual Save; BF-01/no-write controls preserved |
| PostgreSQL/data | New additive pair-dependent CHECK replacing only named constraint | All old valid rows fit new caps≥100000; no backfill/record/history rewrite; fresh/populated/direct insert/update proof planned |
| Rollback | Preserve larger saved pairs; no automatic narrowing | Reviewed forward correction preferred; app-only rollback capability limits disclosed; no delete/clamp/reset |
| AC/STS and evidence plan | Same8AC/10STS IDs prospectively revised, per-category max/max+1/cross-pairs/switches/persistence/access/workflow | Future RED distinguishes changed ACTIVITY/EQUIPMENT expectations from preserved TRAVEL cases; no tests added or run now |

## 3. Actual preparation and validation

- Correct repository/branch, clean initial working tree/index and local/upstream12d40ec verified. Fetch succeeded; maincc6b04c and PR basestaging/sprint-2 ecab746 unchanged. No applicable AGENTS.md found in worktree/ancestor chain/repository inventory. Read all four published documents, current Issue/PR/reviews and relevant unchanged source/CHECK locations.
- Original D2 worktree/PDF rename, environment files, application/test/migration/dependency/CI files and all historical evidence remain outside this change. No original branch reset, force-push, duplicate Issue/PR, cloud operation or app runtime.
- The first attempt to capture pre-revision GitHub history was **not executed**: automatic approval review failed due to an account usage limit. After the student's explicit continuation, the authorized read/capture succeeded. This was an approval-service availability failure, not a test verdict or unsafe-action finding. No bypass was used.
- One draft patch application failed validation because it named the same target twice; no files were modified by that failed patch. Corrected documentation writes followed. No production/test behavior was executed.
- Review full/staged diffs, strict UTF-8, local links/anchors, Markdown tables/fences, AC/STS references, literal category matrix, announcement quote, secret patterns and protected-file preservation before publication. Record actual final counts below, without presenting them as application test results.

Actual documentation validation PASS:7strict-UTF-8 files (6Markdown/1historical JSON),30local link occurrences,15Markdown tables/125rows,8proposed ACs,10planned STS IDs,5verified pinned source objects, exact announcement text, preserved historical preparation body and Issue/PR bodies,0secret-pattern findings and0non-proposal changes. `git diff --check` and staged whitespace checks passed; normal LF-to-CRLF Git notices remain. This Node document checker ran outside Git and invokes no app/test/database. No maintenance RED/GREEN or application suite executed.

## 4. Peer checklist and next action

1. Is the student-selected category policy a sufficiently meaningful bounded change to the accepted Sprint1 rule, without unrelated features?
2. Do server, create/edit forms and SQL enforce the same known category/whole-baht pair, including maximum+1 and the same amount across different categories?
3. Do category switches and restored drafts retain amounts and provide feedback without silent clamping or any automatic write?
4. Are invalid-write snapshots, authorization/Origin/state/revision/history/explicit actions and BF-01 preserved with independently expected cases?
5. Do fresh/populated migration and direct SQL update checks protect existing data and define rollback honestly?
6. Are announcement provenance, historical pending statements, current removed instructor gate and actual peer-review-before-implementation sequence clear?

Next gate: record substantive peer findings/disposition at the new published revision, then follow the reviewed tests-first implementation plan in a separate authorized batch. Instructor/TA approval is no longer a prerequisite. This publication does not itself mark the contract accepted, implement the change or claim release readiness.

Authorship: chaproi selected and directed the revised policy; ChatGPT/Codex assisted analysis/documentation. No instructor-selected policy, personal approval, new student reflection, independent review or execution is fabricated.
