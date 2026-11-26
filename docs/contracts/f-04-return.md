# F-04 — Return an assigned expense

**Current status summary — 26 Nov 2026:** F-04 AC01–05 implemented and verified; reviewed/released/deployed at main cc6b04c8e98191be591a3b755d25988148523909. Actual review chain: PR #39 design and PR #40/#41 implementation; release PR #48; later UI PR #47 preserves behavior. [Per-AC status](../sprints/d2-completion-2026-11-26.md) and [deployed checks](../evidence/deliverable-2/postdeploy-2026-11-26/evidence.md) distinguish source/CI and live coverage. Normative wording, original design dates and historical Pending/Planned entries below are preserved; they do not override this status summary. Owner final D2 acceptance is unrecorded; new external peer UAT is not required for D2.

Contract v1.0 · 24 Nov 2026 · TH-038 · pre-implementation design

Issue: #35. Requirements: FR-04; BR-05, BR-09 (single-stage Sprint 2 subset); NFR-01/02. Author: chaproi with AI assistance. Review: pending independent peer review.

## Feature SDS, workflow and layers

Assigned Reviewer, different from requester, returns a SUBMITTED request to RETURNED with a trimmed reason of 1–300 UTF-16 code units, rejecting NUL/lone surrogates as in current reason validation. The owner can then read that reason/history. APPROVED/REJECTED remain terminal. Stage-specific rules of F-07 are planned, not implemented here.

UI: add a separately labelled Return reason form and Return for correction action next to current Approve/Reject only while SUBMITTED; prevent duplicate pending actions; show saved status/history; safe errors; refresh detail/list after a 409. Existing Reject wording/behavior stays intact.

API: extend POST `/api/expense-requests/:id/decision` with `{decision:"RETURNED",reason,expectedRevision}`. Success 200 returns saved detail including integer `revision`. expectedRevision must match the loaded record, integer 0..2147483647. Detail/list add revision. Approve/Reject also accept expectedRevision; legacy missing revision remains supported only for an untouched revision-0 request. Any post-return/edit/resubmit request requires an explicit revision for decisions. Unknown/extra fields rejected. Revision exhaustion rejects without incrementing.

Data: add RETURNED to ExpenseStatus and RETURNED/EDITED/RESUBMITTED event types; add nonnegative ExpenseRequest.revision default 0 (existing rows backfilled by default). Successful changes increment once; each event and its state update share one transaction. Conditional update tests ID, assigned reviewer, SUBMITTED and revision. Event ordering/history schema otherwise unchanged.

## Acceptance criteria and STS (designed before implementation)

| AC | Observable outcome | Test / level / input → expected |
|---|---|---|
| AC-F04-01 | Assigned Reviewer returns once; owner reads trimmed reason and same request ID | T-F04-01 API/DB: new request rev0 + RETURNED/reason/rev0 → 200, rev1, SUBMITTED then RETURNED events persisted |
| AC-F04-02 | Invalid reason/revision/extra field rejected without mutation | T-F04-02 API: empty/spaces/301/NUL/lone surrogate, wrong type/missing revision/extra owner → 400; exact before/after detail equal; 1/300 and valid Unicode boundaries accepted |
| AC-F04-03 | Authentication, Origin, assignment and self-review remain enforced | T-F04-03 API/DB: anonymous401, requester403, unrelated reviewer404, evil Origin403, self reviewer403; exact record unchanged |
| AC-F04-04 | Terminal/repeated/stale/concurrent actions cannot add transitions | T-F04-04 API/DB: RETURNED/APPROVED/REJECTED or stale revision →409; competing return/approve on fresh request exactly one200 and one409, one event |
| AC-F04-05 | User-facing return journey and durable readback work | T-F04-05 E2E + integration: reviewer form→owner reason/history; restart app/client against same DB→same detail; old records/history unchanged |

## Common response, safety and delivery rules

JSON errors use `{error:{code,message}}`. Invalid input 400 INVALID_INPUT; anonymous 401 UNAUTHENTICATED; wrong role 403 FORBIDDEN; hidden/unowned record 404 NOT_FOUND; invalid state/stale revision 409 INVALID_STATE. Browser writes require the existing exact Origin guard (403 FORBIDDEN_ORIGIN). Rejections never change protected data/history. Never accept owner/reviewer/status from client input. No secrets in JSON/logs/Git.

Each feature is implemented through an Issue, versioned contract/test-design commit, meaningful automated RED before production code, GREEN plus regression, peer-reviewed PR to sprint staging, integration and reviewed main release. Preserve actual command, SHA, runtime and pass/fail/skip output; no accepted/deployed claim before the corresponding gate. Real PostgreSQL persistence/access tests and selected browser journeys supplement unit tests. Existing synthetic fixtures and old history must survive additive migration; no shared DB reset/seed.

Definition of Done: every in-scope AC maps to an executed actual test/check with version/result, UI normal/loading/empty/error/pending/conflict behavior is verified, relevant negative/concurrent/persistence paths pass, contract revisions and implementation diff reviewed, CI/build/Docker pass, integrated main release and post-deploy check recorded. Planned AC never count as passed. Reviewer approval is not fabricated by the author or AI.
