# Lab7 post-release record - 28 November2026

Owner-directed automated verification of released main `c259afe45eb49311c1f7bb9e166c4443041b9b82`. No new external peer UAT, final owner acceptance, submission or Issue closure is claimed. Instructor/TA approval is Not required under the recorded student-supplied announcement.

## Deployment and provenance

- [Existing exact-main CI/deploy run46120371207](https://github.com/chaproi/club-expense-approval/actions/runs/46120371207), attempt1, **success**. No new deployment was triggered.
- `ci/verify` job140903331799: **184 collected/executed/passed,0 failed/skipped/cancelled**; runner5252.856194ms. **23 browser passed,0 failed/skipped**,53.3s. TypeScript/build, Docker and all four migrations passed. See [actual summary](exact-main-results.json), [unit inventory](exact-main-unit-output.log), [browser inventory](exact-main-browser-output.log), [original command excerpts](command-excerpts.log) and [all job/step statuses](jobs.json).
- Migration execution **s981b09c9-migrate-b9khk** completed at **2026-11-28T07:19:49.7350443Z**, before service-deploy step **07:19:49.8765835Z**. Log-reported revision **s981b09c9-00009-fwv**,100% traffic. App: https://s981b09c9-4d7hbszvwq-as.a.run.app.
- Main-tagged image: `asia-southeast1-docker.pkg.dev/cpe-se-course-2026/s981b09c9/s981b09c9:c259afe45eb49311c1f7bb9e166c4443041b9b82`. Pushed registry digest: `sha256:4f5d6c40bafbbf959c27aea5541aef76a6d2a17400c733e209338aaafe9455c2`.
- These are **GitHub deployment-log observations**. No direct Cloud Run/SQL access was established. Registry digest is not a directly resolved revision digest. Exact-main CI logs name `20261127000000_category_amount_limits`; production uses the same main-image/source chain and job succeeds. Production Prisma stdout/applied rows and live named CHECK were not directly read. See [qualified identity](deployment-identity.json).
- [Full submitted PR50/51/52 reviews and identities](review-chain.json) retain reviewer thananun-7203's original attribution. The historical local/PR merge-SHA results are not relabelled as main executions.

## Live results and all attempts

[Commands, exact timestamps, elapsed time and exits](commands.json); [public3/3 results](public-checks.json).

The first authenticated attempt passed A01-A03, then failed A04 on unsupported `getByLabel("Category", {exact:true})` before any browser write. Exit1; A05-A08 unreached. Four synthetic records retained; four owned sessions logged out204. Preserve [original failed attempt](live-checks-attempt-1.json) and [runner](scripts/live-checks-attempt-1.cjs). This is a **test locator error**, not application RED.

After inspecting the released browser tests, the runner uses the inherited `getByRole("combobox", {name:/^Category/})`. Continuation reuses all four records, logs in afresh and executes **six cases A01,A04-A08, all pass**, exit0. Original A02/A03 passes retain original timestamps and are not rerun. [Combined eight-case coverage and actual HTTP statuses](live-checks.json) records the provenance explicitly. No production change or successful-suite refresh occurred.

| Case | Actual verified result |
|---|---|
| L7-A01 | R1/R2/V1 and separate second R1 context authenticate through the real UI; roles/current-session200. V2 was unnecessary and not used. |
| L7-A02 | ACTIVITY150000, EQUIPMENT120000, TRAVEL100000 each201 then exact200 readback, revision0, one SUBMITTED. |
| L7-A03 | Maximum+1 for each category plus EQUIPMENT125000/TRAVEL125000/TRAVEL110000 each400 INVALID_INPUT, owned state/list unchanged; EQUIPMENT110000201. |
| L7-A04 | Real form retains125000 while changing to Equipment/Travel; accessible range feedback, disabled Submit, zero automatic writes; explicit Activity submit201. |
| L7-A05 | Reviewer-create403; cross-owner GET/PATCH404; reviewer-PATCH403; bad-Origin403; submitted-owner PATCH409; owned state exact. |
| L7-A06 | Assigned reviewer Approve/Reject, reason and owner history exact; both terminal PATCH409 leave state unchanged. |
| L7-A07 | Real two-session Save409 INVALID_STATE; latest TRAVEL100000 separate from draft150000; Restore retains invalid TRAVEL150000, linked feedback/disabled controls, no automatic write; explicit correction to Activity/manual Save with latest revision2, Resubmit and approval succeed. Final revision5 and exact six-event history. |
| L7-A08 | Reload reads final detail/history; reviewer summary equals authorized assigned list; requester summary403. Six actor-specific snapshot comparisons cover **three distinct existing records**, unchanged before/after continuation writes. |

The before/after samples were captured **after deployment and before continuation writes**, not before deployment or before the entire first attempt. Only hashes are committed; no private record contents. This is bounded preservation during these checks, not full Cloud SQL preservation.

## Retained synthetic records and cleanup

All five records have `UAT-L7-20261128T074029Z` titles. Exact IDs/final fields/history are in [inventory](live-checks.json) and PDF page21. Final states: two APPROVED (Activity150000, revisions1/5), one REJECTED (Equipment120000,revision1), two SUBMITTED (Travel100000 and Equipment110000,revision0). No records were deleted; no shared/real record was modified, seeded or reset.

Both attempts logged out R1/R2/V1/second-R1 sessions with HTTP204, closed all contexts and Chromium, and completed before documentation work. The temporary private credential file was removed after continuation. No browser process/listener/database/pool was created outside the owned browser run. No passwords, cookies, tokens or raw private snapshots are in this directory. Screenshots mask unrelated request cards. [Lossless crop provenance](screenshot-crops.json) distinguishes print crops from original captures.

## Metrics snapshot and readiness

Common activity window: **2026-11-27T00:00:00+07:00 through2026-11-28T07:22:14.1862118Z**. [Paginated underlying sources](metrics-source.json):6 completed Issues (0Lab7/6other),3 merged Lab7 PRs (2staging/1main), named exact-main npm test184/184,8 known defect records (6resolved/2deferred Low;1High/3Medium/3Low/1unclassified),5 workflow attempts all successful. No Issue was closed to affect counts. [Defect Issue corroboration](defect-issues.json) was a later read; retests remain version-specific.

**READY on the bounded maintained-scope technical evidence**, with explicit direct-cloud, pre-deployment snapshot, inherited Low and dependency-override limitations. The owner's final acceptance/submission remains separate. No new external UAT gate is invented. F-06 totals/F-07/F-08 remain Planned. The [self-contained30-page report](../../../reports/lab-07/report.md) and [PDF](../../../reports/lab-07/output/pdf/club-expense-approval-lab7.pdf) include A/B/C/D weights25/50/15/10, complete relevant AC/STS, actual code/test/SQL/log excerpts, reviews, metrics and limitations.

## Reproduction and safety

Scripts here are evidence collectors, **not application tests to run automatically**. `public-checks.cjs <worktree-with-installed-playwright> <outside-repo-output>` performs read-only public checks. `live-checks.cjs` also accepts a private handoff path (JSON aliasesR1/R2/V1 with email/password) and optional retained attempt path. It performs real synthetic writes and must only be executed under explicit authorization; do not rerun merely to refresh this evidence. Never commit that handoff. Existing private credentials were supplied by the owner, not inferred from seed values.

`prepare-evidence.cjs <repo-root> <downloaded-run-log-directory>` extracts actual retained job logs; `collect-metrics.ps1` records the original authenticated read-only collection method. It expects an existing private `Invoke-UiGitHub` helper and local output path; it is an archived collector, not a portable token or new snapshot. The final PDF can be regenerated offline from committed evidence using the packet README.
