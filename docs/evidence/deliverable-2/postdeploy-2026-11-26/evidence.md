# Deliverable 2 deployment and our post-deployment checks

26 November 2026, Asia/Bangkok. Documentation correction on 26 Nov 2026 removes the earlier invented D2 external-acceptance gate; all actual execution results/SHAs and historical failures are unchanged. **These are owner-directed automated post-deployment checks, not an external peer's independent acceptance. New external peer acceptance is not a mandatory Deliverable 2 gate.** No issue closure, final acceptance, submission or further main change is recorded.

## Release and deployment identity

| Item | Observed evidence |
|---|---|
| Released main | [cc6b04c8e98191be591a3b755d25988148523909](https://github.com/chaproi/club-expense-approval/commit/cc6b04c8e98191be591a3b755d25988148523909) |
| Release PR | [#48](https://github.com/chaproi/club-expense-approval/pull/48), merged 2026-11-26T08:51:46Z |
| Actual final reviewed release head | ecab746d02b33a140775f53a5079bb7f57f5cd42, following the normal main-to-staging synchronization; [thananun-7203 approval](https://github.com/chaproi/club-expense-approval/pull/48#pullrequestreview-6070771204), 08:33:42Z |
| Existing deployment run | [45786768391](https://github.com/chaproi/club-expense-approval/actions/runs/45786768391), push to main, exact cc6b04c, **SUCCESS** |
| Reusable CI | [ci / verify](https://github.com/chaproi/club-expense-approval/actions/runs/45786768391/job/139795385630), **SUCCESS**, 08:51:52–08:54:22Z |
| Deploy job | [deploy](https://github.com/chaproi/club-expense-approval/actions/runs/45786768391/job/139796626455), **SUCCESS**, 08:54:25–08:56:40Z |
| Image tag used by build/push, migration and service deployment | asia-southeast1-docker.pkg.dev/cpe-se-course-2026/s981b09c9/s981b09c9:cc6b04c8e98191be591a3b755d25988148523909 |
| Immutable pushed registry manifest digest | **sha256:2afb158a393ded77dbacb0b29b1bc7559449ed2fa903537ff54165932b934995** |
| Migration execution | **s981b09c9-migrate-hbkpk**, log explicitly reports successful completion at 08:56:19.284Z |
| Service/revision | **s981b09c9 / s981b09c9-00008-pch**, deployed successfully at 08:56:35.546Z |
| Traffic | Deploy log reports **100 percent** to that revision at 08:56:35Z; no later direct Cloud Run query is claimed |
| Deployment-reported URL | https://s981b09c9-670075229477.asia-southeast1.run.app |
| Documented/canonical browser URL actually tested | https://s981b09c9-4d7hbszvwq-as.a.run.app |

[Release review](release-review.json), [job/step timing and outcomes](deployment-run.json), [allowlisted CI log](ci-excerpts.log), and [allowlisted deploy log](deploy-excerpts.log) retain the observations.

The migration step completed before the service deployment step began. The deploy workflow uses one IMAGE variable tagged with the exact main SHA for push, migration-job update and service update; the job log associates that tag with the digest and the successful revision/traffic output. This provides a traceable workflow-level release mapping.

**Direct-cloud evidence limitation:** no gcloud executable or explicit local cloud credential configuration was available. A read-only attempt to inspect the existing signed-in Chrome session was denied by computer-use approval (“not approved to use Google Chrome”); it was not bypassed. Consequently, an independent current service/revision JSON, revision-resolved imageDigest (which may differ from a multi-platform registry manifest digest), current traffic requery, database migration-row inspection, and detailed migration execution task logs were unavailable. The digest above is the **pushed registry manifest digest**, not a falsely claimed independently read revision field. Migration success comes from the actual successful execution/step, not direct SQL observation.

## Exact-main reusable CI results

The existing run's reusable CI checked out **cc6b04c**, not the earlier PR merge-test revision. It installed/generated Client 6.19.3, applied existing migrations to disposable runner PostgreSQL, and passed:

| Check | Actual result |
|---|---|
| Unit/API | **47 executed / 47 passed / 0 failed / 0 skipped / 0 cancelled**; 2.849 s runner duration |
| Chromium browser | **19 executed / 19 passed / 0 failed / 0 skipped**, one worker; 47.9 s reported |
| TypeScript / production build | PASS |
| Docker image build | PASS |
| Build/push, required migration execution, service deployment and runner cleanup | PASS |

These are the actual main deployment run's checks. The prior local 47/19 at source 465ebea, focused breakpoint checks at 3426915, and PR #47 CI at 76d06c3 retain their original provenance. Git comparison found the entire main tree equal to the campus publication tree c59b625 (tree d6598a339d79b8bf351025a1ad6c1060105e62a1); synchronization/merge commits introduced no application changes. No local comprehensive suite, benchmark, new deployment or cloud configuration change was run here.

## Execution and account handling

The user confirmed four existing synthetic live accounts and supplied their private credentials: R1/R2 are Requesters, V1 is the assigned default Reviewer, and V2 is an unassigned Reviewer. Credentials were read only from a temporary private file outside the repository, never stored in browser storage evidence, screenshots, command text records, logs or Git. Login bodies, cookies and session tokens are not captured.

The Node/Playwright harnesses launched separate fresh Chromium contexts, used the real deployed React/Express/PostgreSQL endpoints, and created only clearly labelled synthetic acceptance requests. No seed/reset, account/role change, shared-data deletion, historical edit, direct database mutation, fabricated successful response or transport fault injection was performed. Credential-bearing browser profiles were closed and logouts completed.

Runtime: Windows NT 10.0.26200, Node 24.14.0, Playwright 1.62.1, Chromium 151.0.7922.34. Actual deployed PostgreSQL/server runtime versions were not directly queried; runner PostgreSQL versions are not substituted for Cloud SQL.

| Actual command from the existing UI tooling checkout | Exit | Observation |
|---|---:|---|
| `node --check ../postdeploy-authenticated.mjs` | 0 | Harness syntax, before each authenticated attempt |
| `node ../postdeploy-public.mjs` | 0 | 08:57:28.267–08:57:40.892Z; 8/8 public checks PASS |
| `node ../postdeploy-authenticated.mjs`, attempt 1 | 1 | 09:00:19.264–09:00:57.751Z; 2 passed / 1 harness-selection failure / 7 unreached, no expense created |
| Same authenticated command after concrete selector correction, attempt 2 | 0 | 09:01:37.882–09:02:07.496Z; **10/10 PASS**, 0 failed/not-run |
| `node ../postdeploy-capture-readback.mjs` | 0 | 09:03:11.547–09:03:16.147Z; capture-only correction/readback, **0 domain writes** |

All times above are UTC; add seven hours for Asia/Bangkok. The browser tools were loaded from the existing dependency checkout (c59b625), whose tracked tree equals the release; the application itself was the public deployed release, not a local server. Evidence is committed on a separate documentation branch rooted at cc6b04c.

[Public harness](public-check.mjs), [authenticated harness](authenticated-check.mjs), [capture-only harness](capture-readback.mjs), [public results](public-checks.json), [authenticated results](authenticated-checks.json), and [capture correction](capture-correction.json) are retained. To reproduce, provide a private external PD_OUT directory with accounts.private.json mapping R1/R2/V1/V2 to email/password, install the existing lockfile dependencies, and invoke the selected harness from the project tooling checkout. Do not run these live writing checks as CI; use a new labelled run and explicit authorization. No secret example values are included.

### Preserved failed attempt and observation correction

Attempt 1 authenticated all four roles and verified logout/revoked-session behavior, then timed out selecting `getByLabel("Category", {exact:true})` while preparing the first request. No expense POST occurred. The form's wrapping label includes select content; the inherited tests use a non-exact Category lookup. The harness was corrected to a unique combobox with accessible name beginning Category, retaining the intended actual control and all workflow assertions. No timeout, application code or assertion expectation changed. [Attempt 1 results](attempt-1/results.json) preserve the failure and its cleanup, separately from successful attempt 2.

Initial per-card screenshot masks extended outside the scroll-clipped list and obscured mobile detail. Those initial artifacts are retained privately outside Git. Four read-only captures were repeated using the bounded entire request list as a grey privacy mask; the authenticated workflow itself was not repeated. Both selected records were read before/after and remained exact. The real-conflict desktop capture remains from the actual 409 state, before Restore/manual Save, and uses the initial magenta historical-card masks. Masks are explicit redaction, not blank/empty application data or layout evidence for those concealed card contents.

A local Git read in an elevated process also rejected the sandbox-owned evidence worktree as dubious ownership. No global safe.directory or security setting was changed; Git validation/commit uses the owning workspace context, and any authenticated push uses a per-command exception limited to that verified worktree.

## Case results

Each JSON case records roles, starting conditions, expected/actual result and UTC timestamps. Public requests use the root page and actual documented API endpoints; **no /health endpoint is assumed**.

| Case | Role/scope | Expected / observed | Result |
|---|---|---|---|
| PD-P01 | Anonymous | Documented root HTTP 200, real login form | PASS |
| PD-P02 | Anonymous | Deployment-reported URL reaches same canonical HTTPS login origin | PASS |
| PD-P03 | Anonymous | me/list/summary all 401 UNAUTHENTICATED, safe envelope and no-store | PASS |
| PD-P04 | Wrong Origin, no valid account | Login 403 FORBIDDEN_ORIGIN before credentials; no session issued | PASS |
| PD-P05 | Desktop public, 1440×1000 | Login controls reachable; Tab/Shift+Tab and focus; scroll width 1440 | PASS |
| PD-P06 | Mobile public, 390×844 | Same controls and keyboard checks; scroll width 390 | PASS |
| PD-P07 | Reduced motion | Artwork animation none, transition 0s | PASS |
| PD-P08 | Public assets | Served JS/CSS bytes equal the release-equivalent build; hashes retained | PASS |
| PD-A01 | R1/R2/V1/V2 | All real logins/me roles; logout204; original cookie me/list401; fresh login works | PASS |
| PD-A02 | Four authorized scopes | Snapshot current existing records privately before new domain writes; publish counts/digests only | PASS |
| PD-A03 | R1/V1 | Submit201, approve200, owner same ID/history SUBMITTED→APPROVED, rev1 | PASS |
| PD-A04 | R1/V1 | Submit/reject200, owner sees synthetic reason and SUBMITTED→REJECTED, rev1 | PASS |
| PD-A05 | R1/V1 | Return→owner reason→edit/Save→Resubmit→approve→complete owner history; original ID/createdAt retained, rev4 | PASS |
| PD-A06 | R1/R2/V1/V2 | Role403, cross-owner404, unassigned Reviewer404, stale decision409, terminal edit409, authenticated Origin403; exact protected detail/history unchanged | PASS |
| PD-A07 | Two real sessions of R1, V1 | Actual stale Save409; separated latest/draft/title conflict; Restore issues zero mutations; explicit Save on current revision, latest untouched Travel/610 retained, rev3 | PASS |
| PD-A08 | V1/V2 | All four summary bins/UI match independent current authorized lists, no V2 access to V1 acceptance records | PASS |
| PD-A09 | V1, actual 768px | Long synthetic title/detail/decision controls, Enter selection, Tab/Shift+Tab; width=scrollWidth=768, one grid column, reduced motion | PASS |
| PD-A10 | R1 mobile and four historical scopes | 390px owner complete history/readback after reload; pre-existing details/history checksums unchanged during our session | PASS |

Final successful observations: **18 checks passed, 0 failed/not-run** (8 public + 10 authenticated), not an application test-suite total. The separate earlier harness attempt retains its 2-pass/1-failure/7-unreached verdict. The four capture-only replacements are not counted as additional acceptance cases.

At PD-A08, V1 independently counted SUBMITTED=9, RETURNED=1, APPROVED=5, REJECTED=4, total=19; V2 all zeros/total0 and no acceptance assignments. PD-A09 then intentionally created a fifth SUBMITTED request: final screenshot summary is SUBMITTED=10, RETURNED=1, APPROVED=5, REJECTED=4, total20. The difference is the documented extra fixture, not inconsistent evidence.

## Retained synthetic records

Run marker: **UAT-D2-20261126T090137Z**. All five requests belong to R1 and are assigned to V1. They are intentionally retained for the operator, not deleted or reset.

| Case | Request ID | Final status | Revision | Exact history types |
|---|---|---|---:|---|
| A03 | afd75ea9-0d17-469f-b69c-8b4ddaf843dd | APPROVED | 1 | SUBMITTED, APPROVED |
| A04 | db27aff9-f9b0-44d1-8f3e-834431833a46 | REJECTED | 1 | SUBMITTED, REJECTED |
| A05 | 8c02cdde-64f2-4647-abbc-758d7d2f7542 | APPROVED | 4 | SUBMITTED, RETURNED, EDITED, RESUBMITTED, APPROVED |
| A07 | 604b579d-93a7-4da2-91cc-6c53fe74f2ea | RETURNED | 3 | SUBMITTED, RETURNED, EDITED, EDITED |
| A09 | fd5d8a3e-ace9-4915-acd3-b4e7599412b6 | SUBMITTED | 0 | SUBMITTED |

Total newly retained domain state: five requests / fourteen history events. Initial/current revisions, synthetic titles and createdAt values are in authenticated-checks.json. The A05 and A07 initial creation titles differ from their intentionally edited final titles; exact final values were asserted.

## Data preservation and limits

Before any domain writes in attempt 2, R1 exposed 13 existing requests and R2 two; V1 exposed their combined 15 and V2 zero. The final exact authorized-detail comparisons, including history and timestamps, matched all four scope checksums. This also confirms the protected legacy Lab 5 ID **96da5843-9984-4a30-a6f2-883e19243420** remains readable; it was never modified.

This is **15 unique existing records unchanged during our post-deployment checks**, not an exact pre-release snapshot comparison. No suitable complete pre-release shared-data baseline was available. The earlier [populated isolated upgrade evidence](../dependency-remediation/verification.md#populated-baseline-upgrade-on-the-new-candidate) tested baseline43aa8d7→candidate a6c93ab; it is not relabelled as a live Cloud SQL migration-preservation test. No application instance restart or second redeployment was performed in this batch.

Wrong-role/cross-owner/stale/Origin HTTP evidence is redacted to safe status/code/message and owned projections. Existing-record path IDs are redacted in the saved HTTP trace; pre-existing titles, reasons and contents are not published.

## Inspected deployed screenshots

All seven final screenshots were inspected at useful resolution. [screenshots.json](screenshots.json) records byte lengths and SHA-256; metadata timestamps, roles, viewport and selected record/revision are in the corresponding results/capture JSON.

| State | Screenshot |
|---|---|
| Deployed login desktop | [1440×1000](screenshots/deployed-login-1440.png) |
| Deployed login mobile | [390×844](screenshots/deployed-login-390.png) |
| Complete owner history | [Desktop](screenshots/deployed-owner-complete-history.png) |
| Real 409 saved/draft separation | [Desktop actual conflict](screenshots/deployed-real-conflict-draft.png) |
| Reviewer decision controls / long title | [768px](screenshots/deployed-reviewer-768.png), [desktop](screenshots/deployed-reviewer-desktop.png) |
| Owner complete history mobile | [390px](screenshots/deployed-owner-mobile.png) |

Grey request-list blocks (and magenta historical cards in the original conflict capture) are deliberate screenshot privacy redactions. The selected synthetic detail/history, controls, header and summary are actual rendered deployed UI. Chromium viewport emulation, keyboard and reduced-motion observations do not certify cross-browser, physical-device, screen-reader or comprehensive WCAG behavior.

## Cleanup, remaining decisions and handoff

All owned browser contexts and processes were closed. R1/R2/V1/V2 primary logouts returned204, and their subsequent me requests returned401. The second R1 conflict session was sent logout and disposed; the capture-only R1/V1 sessions also returned204 then401. Exact database session inventory cannot be independently queried without cloud access; no such claim is made. No cookies/storage state were saved. The temporary credential file was removed after scanning the evidence for secrets; see the independent [cleanup record](cleanup.json) and [validation record](validation.json). The authenticated command result retains its contemporaneous false flag because the private file still existed when that command ended; the separate cleanup confirms subsequent removal. Original checkout/local work/environment and any manual preview were not changed.

The existing deployment completed; this batch neither retriggered it nor changed cloud settings, production code, thresholds, dependencies or main. The documentation/evidence branch is separate and is not a main release. Source and earlier review/evidence records remain intact.

Remaining human/operational obligations are concrete:

1. Obtain an authorized direct read of revision imageDigest/current traffic and migration task details if required beyond the successful deployment-log chain.
2. Decide whether available legacy-record continuity plus the isolated upgrade rehearsal is sufficient, or provide a suitable private pre-release baseline for stronger shared-data preservation comparison.
3. Preserve the original version-specific [Lab 6 independent UAT/retest record](../../../labs/lab-06/retest-status-2026-11-26.md). No new external peer acceptance is required for D2. Any outstanding Lab 6 report/reciprocal evidence belongs to its separate handoff; the owner makes the final D2 acceptance decision.
4. Retain the accepted dependency override caveat, cross-tab/UTF-16 limitations and optional UI suggestions; F-06 totals, F-07 and F-08 remain planned.
5. The owner decides final D2 acceptance/PDF/submission with these disclosed limitations visible. No new external UAT or direct-cloud inspection is silently imposed as a mandatory D2 gate. No acceptance, submission or issue closure is promoted here.

Documentation checks: strict UTF-8, local links and Markdown tables, screenshot digests, harness syntax, secret scan, full/staged diff and whitespace were checked before publication. Only this new evidence directory is changed; production, existing tests, dependencies, schema, environment and historical artifact bytes remain untouched.
