# Deliverable 2 verification ledger

24 Nov 2026; author chaproi with AI assistance. Contracts committed before implementation. Independent review, staging integration, main release, deployment and acceptance are still pending.

- Baseline: 34/34 unit/API tests on unchanged production code, native PostgreSQL17.12 / Node24.22.3.
- Meaningful RED: 13 new tests fail for unsupported RETURNED/revision/resubmit/summary behavior (not syntax/fixture failure).
- GREEN: 47/47 unit/API, zero failed/skipped; build PASS. Return and edit/resubmit conditional transactions, ownership/role/Origin denial, stale/concurrent actions, summary scoping and restart readback are covered. See manifests and actual output.
- Additive migration: three existing SUBMITTED/APPROVED/REJECTED rows and three old history events unchanged; revision backfilled0; verification uses a separate new client after migration as deployment does.
- RED→GREEN tests retain assertions/inputs; TypeScript-only category const annotation is disclosed. T-04 preserves SUBMITTED read-only protection with409 under the new edit endpoint contract.
- Local Chromium launch blocked by executor Unix-socket policy before UI execution; all three browser attempts failed at launch. Hosted standard Playwright CI is the remaining browser validation path. Do not present local attempts as passes.
- F-06 category sums, F-07 two-stage approval and F-08 filtering are PLANNED Final work, not implemented by this increment.

Commands: `npm test`; `npm run build`; `npm run db:migrate`; selected source/test hashes and actual outputs are adjacent. The local disposable PostgreSQL launcher is tooling outside the repository and did not access the assessed Cloud SQL database.

## Hosted result and candidate update

Actual PR40 run45236047280 SUCCESS atfeea765:47 API tests,2 original browser tests, production build and Docker build PASS. PR41 run45237202381 SUCCESS at830346b:47 API tests,3 browser tests, production build and Docker build PASS. Downloaded browser artifact digest was verified; both screenshots were visually inspected and show returned reason/summary and corrected final request/history. These are hosted synthetic tests, not live GCP retests.

Explicit self-return and revision-exhaustion assertions were then added without production changes; local final-api-verification.log47/47 PASS. Final exact-head hosted checks remain mandatory. Latest heads/check URLs are recorded in PR41 and reviewer handoff; do not assume ancestor CI is a new-head pass.

Source feature implementation and independent acceptance remain distinct. Manual transient UI checks, independent review, integrated staging/main checks, actual deployment and post-deploy shared-data readback are outstanding gates.
