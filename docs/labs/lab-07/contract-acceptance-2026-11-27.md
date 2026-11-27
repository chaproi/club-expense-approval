# Lab 7 contract acceptance and RED-stage handoff

27 November 2026, Asia/Bangkok. [Issue49](https://github.com/chaproi/club-expense-approval/issues/49); contract [PR50](https://github.com/chaproi/club-expense-approval/pull/50).

## Verified contract acceptance (not implementation acceptance)

- Independent reviewer: **thananun-7203**. Submitted **APPROVED** review at **2026-11-27T06:11:30Z** (13:11:30 Bangkok), on exact head **c7f1c88e0b3bc78322d1dcc34c9ceb4c397361eb**.
- [Actual substantive review](https://github.com/chaproi/club-expense-approval/pull/50#pullrequestreview-6084244796) covers six axes, the category-pair policy,8AC/10STS, security/history/draft invariants, SQL preservation and rollback. No binding contract finding remains in that submitted review. Non-blocking implementation guidance discusses controlled create-form state, truthful category-aware API errors, restored invalid-pair feedback and cosmetic spacing. These are guidance, not completed code changes.
- PR50 merged into **staging/sprint-2** as **453528073038a3122ecd7abb0adac7bf09a1dc41** at **2026-11-27T07:05:24Z** (14:05:24 Bangkok). Fresh fetch and live PR/review reads verified these identities before branch creation.
- Instructor/TA approval is **Not required under updated instructor announcement**, not Approved. The [student-supplied announcement and provenance limits](instructor-announcement-2026-11-27.md) remain unchanged; that removed gate is not restored.

Accepted contract for the next implementation: ACTIVITY integer1–150000; EQUIPMENT integer1–120000; TRAVEL integer1–100000. Applies to creation and owner-authorized RETURNED Save, category switches, restored drafts and the PostgreSQL CHECK. Substantive contract review is completed; implementation/code peer review, integration and operational deployment of this policy remain pending. This is not instructor grading/complexity certification or whole-product acceptance.

## Actual pre-change source and branch

New isolated worktree/branch: **feat/lab7-category-limits**, from fetched staging **453528073038a3122ecd7abb0adac7bf09a1dc41**. Deployed main remains **cc6b04c8e98191be591a3b755d25988148523909**. The staging-to-main diff contains only the seven proposal documents; server/client, schema/applied migrations, manifests/lockfile, Docker/Compose, Playwright and workflows are byte-identical. No intervening production change was found.

The actual pre-change parser and both UI amount inputs still enforce100000; the original SQL CHECK remains `amountBaht BETWEEN 1 AND 100000`. No new executable migration is present. Tests must exercise that old database rather than failing because a future file/helper is missing.

Original12d40ec proposal, revisedc7f1c88 contract, former Pending text, original preparation attempts and announcement remain preserved. Current acceptance supersedes only the old **peer-contract-review Pending** checkpoint; it does not rewrite the historical source or claim implementation execution.

## Authorized RED-only batch

1. Commit this acceptance/plan update separately.
2. Commit tests before execution. Use literal independent category matrices; revise only the existing EQUIPMENT100001-invalid boundary to120001 and ACTIVITY100001-invalid to150001, retaining unrelated assertions.
3. Focused unit, real authenticated API/PostgreSQL, direct SQL savepoint and real-browser checks against unchanged production, using a newly owned disposable database. Fixtures use old-range amounts; successful prerequisite setup is distinguished from new-policy assertions. Preserve passing ordinary/TRAVEL/security controls; report deeper assertions unreached after an earlier failure.
4. Keep exact commands, tested source/tests SHA, UTC/runtime/isolation/counts/exit/error/reached and cleanup evidence, including any setup corrections. No GREEN, production/UI/SQL/dependency/configuration change, PR, merge, deployment or Issue closure.

Future fresh/populated **new-policy migration** verification and changed/preserved live checks remain unexecuted. Current direct SQL RED concerns the original migrated database, not migration adoption. Historical47API/19browser proposal CI atc7f1c88 is unchanged-production evidence only and is not Lab7 GREEN.

## Subsequent RED execution

The later [27November tests-first execution record](red-verification-2026-11-27.md) links committed tests, actual failures/passing controls, unreached assertions and independent cleanup. This appends execution evidence after the handoff above; it does not rewrite the original pre-execution checkpoint or promote implementation/deployment acceptance.
