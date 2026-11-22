# Lab 6: incoming UAT triage and correction

Status on 2026-11-22: two Medium defects accepted and corrected on a feature branch; release and independent retest are pending. This document does not declare final acceptance.

## Incoming independent evidence

TH-033_P3 (cottonlnwza and thananun-7203) reported 18/18 scripted sub-cases PASS, including UAT-08B, plus two exploratory failures and two non-blocking observations. Their original private archive is `TH038_UAT_Evidence_TH033P3.zip`: 20 CSV execution rows, one report, two JSON files and 22 screenshots. Archive SHA-256: `f13a83e5b682700e25054a44fd46827bf282e6824c674546b0c73f2d7299ea34`. Screenshots and credentials are not republished here.

Tested application: `1cc7df74c3f3240cff0c8a4d422f3f685a8acbce`; handoff document: `402bf67ea94c840283241549b0284acc0248e858`. Revisions: `s981b09c9-00005-9sk` and `s981b09c9-uat08b-20261122064113`, same image digest `sha256:0d12bd57a188047b7b1f5e766e0315682da08869b2218572d919932cf4041b78`.

The team's post-restart JSON readback at `2026-11-22T07:18:21.460Z` reports HTTP 200 and exact equality with the pre-restart snapshot for record `3281e269-eb08-480c-bfda-0c8ef54e7783`, including its two history events. They also report that the existing Lab 5 record `96da5843-9984-4a30-a6f2-883e19243420` remains SUBMITTED with its original timestamp and one event. These are incoming tester results, not executions of the fix branch.

## Triage

| Finding | Severity | Decision and action | Current verification |
| --- | --- | --- | --- |
| [DEF-TH038-01 / #30](https://github.com/chaproi/club-expense-approval/issues/30): malformed login email produces 500 | Medium | Accepted. Reject NUL and unpaired Unicode surrogates before Prisma lookup with the Section E 400 `INVALID_INPUT` response. | Local RED and GREEN observed; PostgreSQL CI and deployed independent retest pending. |
| [DEF-TH038-02 / #31](https://github.com/chaproi/club-expense-approval/issues/31): official Cloud Run alias serves a login form whose submissions are blocked | Medium | Accepted. Redirect frontend GET/HEAD requests to configured `APP_ORIGIN` before serving the form. Preserve API contracts and exact-origin write protection. | Local RED and GREEN observed; deployed alias-to-canonical browser login retest pending. |
| OBS-TH038-01: another tab logs out but the original UI remains in its authenticated workspace after a 401 | Low | Accepted as a non-blocking UX observation. Defer automatic UI session reset to follow-up; API authentication still denies the operation. | Not changed or claimed resolved by this patch. |
| OBS-TH038-02: 61 emoji in a title are rejected by UTF-16 length counting | Low | Accepted as a discrepancy with BR-01's character limit. Defer a consistent Unicode counting rule and matching client/server boundary tests to follow-up. | Not changed or claimed resolved by this patch. |

The team's decision remains **Conditional Acceptance / Pending Defect Resolution**. Only the independent testers can issue their final decision, including whether the documented Low observations are acceptable.

## Root causes and changes

`server/src/auth.ts` previously checked email type and length but allowed PostgreSQL-incompatible text through to Prisma. Its Unicode-aware invalid-text guard rejects NUL and lone high/low surrogate code points while permitting a valid surrogate pair. Invalid requests do not create sessions or revoke an existing valid session.

`server/src/app.ts` previously served the same frontend from both Cloud Run hostnames even though login writes accept only `APP_ORIGIN`. The frontend now returns 308 for noncanonical GET/HEAD navigation, retaining path/query. The destination origin comes only from configuration. Host and forwarded headers cannot choose another destination. Canonical navigation serves normally, while API routes run before this middleware and retain JSON 401/403 behavior. Users entering via the alias must follow the redirect and log in on the canonical origin.

Only these two production files change. There are no schema, migration, seed, dependency, deployment-workflow or database changes in this correction.

## RED → GREEN and regression evidence

The feature branch starts at staging `460c6470bef91238c238361dcbe268d385c3b711`, whose source tree matches the tested main application `1cc7df74c3f3240cff0c8a4d422f3f685a8acbce`. Commit `36908ef` records the new tests and RED evidence before production changes.

| Check | Observed result | Evidence |
| --- | --- | --- |
| Original production code plus defect tests | 15 executed, 9 PASS, 6 FAIL; expected exit 1. Three malformed-email cases return 500; three alias-navigation cases return 200 instead of 308. | [RED log](evidence/local/defects-red.log), [source/test hashes](evidence/local/red-verification.json) |
| Same unchanged defect tests after correction | 15/15 PASS, no skips; exit 0. | [GREEN log](evidence/local/defects-green.log), [source/test hashes](evidence/local/green-verification.json) |
| Complete unit/API suite | 34/34 PASS, no skips; exit 0. Includes authorization, input validation, stale/concurrent decisions and restart readback. | [Regression log](evidence/local/regression-unit-api.log) |
| TypeScript and Vite production build | Exit 0. | [Build log](evidence/local/regression-build.log) |
| Existing Playwright browser regression | 2/2 PASS, no skips; exit 0. | [Browser log](evidence/local/regression-e2e.log) |

Local runtime: Node v24.22.3, Prisma 6.19.3, disposable **PGlite PostgreSQL WASM engine over TCP**, not standalone PostgreSQL. Database-backed tests used the real Prisma request path against that local engine. Canonical-host tests use a static HTML fixture and an unused database stub because their requests must not access the database. Browser regression used installed Chromium 153 through a temporary launch-only Playwright configuration; committed test cases and assertions were unchanged. API test files ran serially for this local engine. The logs' HEAD values identify the pre-commit checkout; JSON manifests identify the exact tested production and test bytes by SHA-256.

These local results supplement, and do not replace, the repository's required CI on PostgreSQL 17 with its normal test commands, browser installation and Docker build. [Regression manifest](evidence/local/regression-verification.json).

## Review, release and independent retest checklist

- [ ] Inspect CI on the exact fix PR head: PostgreSQL 17 tests, build, browser tests and Docker image build.
- [ ] Obtain substantive external peer review of the production diff and regression evidence before merge into staging.
- [ ] Release the reviewed source to main through the normal reviewed workflow, then record the actual release SHA, deployment run, serving revision, image digest and traffic.
- [ ] Smoke-test canonical login/logout and alias GET → canonical page → valid login; verify the existing Lab 5 fixture without modifying it.
- [ ] Give TH-033_P3 the exact new version and request independent retest of both original malformed-email payloads and the browser alias login flow. Record their timestamps, responses, evidence and regression results.
- [ ] Record the team's final acceptance decision and the explicit disposition of both Low observations. Keep #30 and #31 open until the independent retest has been recorded.

No production deployment, independent fix retest, final acceptance, or reciprocal TTworkshop restart PASS is claimed by this document.
