# F-08 — Permission-scoped status filtering (planned)

Contract v1.1 · 24 Nov 2026 · TH-038 · pre-implementation design

Issue: #38. Requirements: FR-08; BR-10; NFR-01/02; F-07 intermediate-state dependency. Author: chaproi with AI assistance. Review: pending independent peer review.

## Feature SDS / planned UI/API/data contract

PLANNED, not implemented/tested by writing this contract. Requester and Reviewer filter only already-authorized lists. A status filter never grants record access. Depends on F-02/F-03 and F-07 for PENDING_FINAL_REVIEW.

UI: status selector with All statuses plus the supported current state names. Changing selection refetches; explicit loading/empty/error; preserve selected filter when saving a decision and reload the correctly scoped list. Show no global counts/private records through filter options. Detail authorization remains independent of list filtering.

API planned: GET `/api/expense-requests?status=SUBMITTED|RETURNED|PENDING_FINAL_REVIEW|APPROVED|REJECTED`. Omitted means all permitted states. Exactly one string status value; unsupported/empty/repeated/malformed/unknown query keys400 INVALID_INPUT; no total-count cross-user leak. Success200 retains `{items}` sorted createdAt DESC/id DESC. Authentication401; existing roles/owner/assigned predicate applied together with optional status in the DB query. Forged principal fields ignored only where explicitly specified; otherwise rejected.

Data: no new schema required if F-07 statuses/indexes suffice; assess scoped-query index for actual access pattern and document if no additional index needed. Never filter global data only in the browser.

| AC | Observable rule / planned STS |
|---|---|
| AC-F08-01 | T-F08-01 API/DB: no status→all authorized rows; each status→only matching authorized records, deterministic sort |
| AC-F08-02 | T-F08-02 API: unknown/empty/repeated/forged query400; anonymous401, no private response data |
| AC-F08-03 | T-F08-03 security DB: other-owner/other-reviewer fixture never appears under any status or all-status query |
| AC-F08-04 | T-F08-04 E2E: select status/all, empty result, safe loading/error and refreshed list after a transition |
| AC-F08-05 | T-F08-05 cross-feature DB/E2E: PENDING_FINAL_REVIEW and both assigned-stage views respect F-07 policy without duplicate list entries |

## Common response, safety and delivery rules

JSON errors use `{error:{code,message}}`. Invalid input 400 INVALID_INPUT; anonymous 401 UNAUTHENTICATED; wrong role 403 FORBIDDEN; hidden/unowned record 404 NOT_FOUND; invalid state/stale revision 409 INVALID_STATE. Browser writes require the existing exact Origin guard (403 FORBIDDEN_ORIGIN). Rejections never change protected data/history. Never accept owner/reviewer/status from client input. No secrets in JSON/logs/Git.

Each feature is implemented through an Issue, versioned contract/test-design commit, meaningful automated RED before production code, GREEN plus regression, peer-reviewed PR to sprint staging, integration and reviewed main release. Preserve actual command, SHA, runtime and pass/fail/skip output; no accepted/deployed claim before the corresponding gate. Real PostgreSQL persistence/access tests and selected browser journeys supplement unit tests. Existing synthetic fixtures and old history must survive additive migration; no shared DB reset/seed.

Definition of Done: every in-scope AC maps to an executed actual test/check with version/result, UI normal/loading/empty/error/pending/conflict behavior is verified, relevant negative/concurrent/persistence paths pass, contract revisions and implementation diff reviewed, CI/build/Docker pass, integrated main release and post-deploy check recorded. Planned AC never count as passed. Reviewer approval is not fabricated by the author or AI.

Design consistency revision v1.1: use PENDING_FINAL_REVIEW, the same intermediate-state name as the original System SDS/baseline. This is a planned contract correction before F-07/F-08 code, not a deployed API change.
