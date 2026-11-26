# Lab 7 proposal preparation and documentation validation

27 November 2026 (Asia/Bangkok). [Proposal Issue49](https://github.com/chaproi/club-expense-approval/issues/49), [request/impact](proposal.md), [proposed contract/STS](contract-proposed-v1.md), [A–D evidence plan](evidence-plan.md). **Proposal only; instructor/TA and peer contract review PENDING.** No changed-behavior test or implementation has been written/executed.

## Repository and preservation

Repository identity: `https://github.com/chaproi/club-expense-approval.git`. Initial worktree: existing D2 documentation checkout on `docs/d2-postdeploy-2026-11-26`, HEAD427d7c01ea9a62a5172a9a85ce4c6a9d48326e23. It contains a user-owned pending deletion of the original PDF path and an untracked renamed `Deliverable2_TH-038_P5.pdf`. Neither was restored, staged, removed or overwritten.

Origin fetch succeeded. Current main remainedcc6b04c8e98191be591a3b755d25988148523909. Sprint2 stagingecab746 has the same tree as main (`d6598a339d79b8bf351025a1ad6c1060105e62a1`); Sprint3 staging48d10cf is older. A new isolated worktree/branch `docs/lab7-amount-limit-proposal` was created from fetched origin/maincc6b04c, initially clean. No existing branch was switched/reset or force-updated. No environment values were printed or copied; no app or database connection was started. Completed D2 evidence and active previews were left alone.

No applicable AGENTS.md was found in the original checkout/ancestor chain or repository inventory; no separate CONTRIBUTING/workflow Markdown was found. README, reviewer handoff, baseline/SRS/Feature/System SDS/traceability, relevant F-04/F-05 contracts, actual source/tests/schema/migrations and existing CI/deploy workflow were read. Current main contains older D2-status wording than the separate completed D2 documentation branch; this proposal does not relabel those historical checkpoints or amend the completed report.

## Source verification and actual operations

| Activity / command | Actual result |
|---|---|
| `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, `git remote -v`, `git worktree list` | Verified original branch/HEAD, repository and pending PDF filename work above; preserved. |
| `git fetch origin`; remote refs/log/tree comparisons | Succeeded; current values above. Initial PowerShell unquoted `^{tree}` syntax failed before comparison; correctly quoted follow-up succeeded. |
| `git worktree add -b docs/lab7-amount-limit-proposal <new-isolated-worktree> origin/main` | Exit0; exact basecc6b04c, clean initial tree. |
| Supplied Lab7 PDF extraction/render/read | All7pages read and visually inspected; SHA-256 `13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb`. Rubric25/50/15/10, instructor approval, reviewed contract before code, semantic RED, five metrics and scoped readiness verified. Existing isolated PDF tools used outside Git; no application dependency changes. |
| `git show 43aa8d7:<baseline/source/migration>` and targeted `rg` / source reads | Confirmed accepted100000 rule; current POST and returned-edit parser call graph, two UI constraints and SQL CHECK. Found a technically required new range-constraint migration; no migration was created. Existing API cases do not substitute for a direct database CHECK proof. |
| GitHub authentication / duplicate search | `gh` was unavailable on PATH; existing private Git credential/REST helper authenticated as chaproi without exposing credentials. Read-only search of current Issue inventory found no existing matching Lab7 amount-limit proposal. |
| Authorized GitHub Issue creation | POST created Issue49, OPEN, authorchaproi,2026-11-26T18:02:58Z. Scope/old/new/baseline/current source, approval fields and peer review explicitly Pending; no assignee/reviewer message, PR, merge, project/checklist promotion or deployment. |
| Documentation checks / normal publication | Exact final results recorded below; only new Lab7 proposal documents may be staged. No application suites, RED/GREEN, builds, Docker, migration, seed or live-data operations. |

Two discovery commands used unsupported PowerShell/rg filename glob syntax and were corrected with directory searches/quoted Git expressions; no behavioral result is inferred from them. A broad tool-location search encountered access-denied entries in the isolated PDF-tools directory; it did not change permissions or files. GitHub CLI availability was resolved through the existing authorized REST helper, not by installing dependencies or bypassing approval.

## Validation scope

Check strict UTF-8, Markdown table consistency, local links/anchors,8prospective ACs/10prospective STS IDs with bidirectional mappings, immutable baseline/current/D2 references, no unresolved publication placeholder and no secret patterns. Verify pinned Git objects locally; remote availability of every historical URL is not a new acceptance claim. Check complete/staged diffs and whitespace; all tracked non-Lab7 files must remain identical to the actual base. Environment files and original D2 pending rename must remain untouched.

PartC metric collection remains UNEXECUTED. Documentation file/link/AC counts below are preparation checks, not invented engineering-outcome metrics or application pass totals. New proposal publication does not make instructor/TA approval, peer review or implementation effective. Future maintenance evidence remains NOT READY as explained in the evidence plan.

Actual documentation validation: PASS,4strict-UTF-8 Markdown files,14local link occurrences,11tables/95rows,8unique proposed ACs,10unique planned STS IDs,5verified pinned source objects,0secret-pattern findings and0changes to pre-existing tracked files. The isolated documentation-only Node validator checked definitions/references, links, table widths, fence pairing, source objects and scope. `git diff --check` passed. No application test/build or database command was executed; no runtime/fixture cleanup was required because none was started. Rendered source-rubric pages and the documentation validator remain outside Git.

## Message for the student to forward (not sent)

> Please approve the proposed Lab7 maintenance change for TH-038, Club Expense Approval: increase BR-01's whole-baht amount ceiling from100,000 to150,000 for creation and existing owner-only RETURNED edits. The rule already exists in accepted Sprint1 at43aa8d7; current pre-change main iscc6b04c. The proposal preserves authentication/ownership/Origin, statuses, revision/history and all old records. Inspection found a PostgreSQL CHECK, so the scope includes a new additive range-constraint migration as well as server/UI validation. Proposal Issue49 and the versioned impact/AC/STS/evidence plan are ready for review. This is my student proposal, not a stakeholder request. May I proceed with this exact scope? I will record your decision and obtain external peer contract review before RED/implementation.

Authorship: chaproi selected/directs the proposal; ChatGPT assisted contract/impact discussion and Codex inspected evidence/prepared documents. Existing solo permission is preserved; external peer review and instructor approval have not occurred for this change. No approval or student retrospective is fabricated.
