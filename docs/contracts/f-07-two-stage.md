# F-07 — Fixed two-stage approval (planned)

Contract v1.0 · 24 Nov 2026 · TH-038 · pre-implementation design

Issue: #38. Requirements: FR-07; BR-03/08/09; NFR-01/02. Author: chaproi with AI assistance. Review: pending independent peer review.

## Feature SDS / planned UI/API/data contract

PLANNED, not implemented or tested by writing this document. Depends on F-03/F-05. Server assigns two distinct seeded REVIEWER accounts using DEFAULT_REVIEWER_EMAIL and FINAL_REVIEWER_EMAIL; both differ from requester. Missing/invalid assignment returns503 before insertion or upgrade. Do not expose role/stage choice to client input.

Workflow: SUBMITTED (stage1)→PENDING_FINAL (stage2)→APPROVED. Current-stage Reviewer may REJECTED or RETURNED with a required1–300 reason. Owner edit/resubmit from RETURNED resets current stage to1 and advances revision while preserving prior events. Terminal requests remain read-only. Every decision uses state+stage+revision conditional transaction; stale round/step cannot be replayed.

UI: display current stage, assigned-stage identities appropriate to permission, stage history and pending final outcome; only current-stage reviewer sees action controls. Owner sees both outcomes. Existing F-04/F-05 conflict/reload semantics remain.

API planned: existing create/detail/decision/resubmit DTOs add currentStage, initialReviewerId/finalReviewerId as safe server-owned identities and revision. Decisions require expectedRevision; stage is derived server-side. Return200 updated detail, validation400/unauth401/wrong role403/hidden404/stale-state409/config503. Compatibility of legacy first-round no-revision requests must be deliberately retired or constrained in a versioned revision before rollout.

Data planned: add PENDING_FINAL, stage field, finalReviewerId relation and stage/revision details on new events. Terminal legacy APPROVED/REJECTED rows and old timeline remain unchanged and are explicitly labelled historical single-stage. Inventory open SUBMITTED/RETURNED rows, dry-run and validate final-reviewer assignments before backfill; upgrade open rows to stage1 while retaining prior history. Use additive migrations/backfill with rollback/recovery instructions; never guess reviewer or reset shared DB. F-06/F-08 must understand intermediate state before release.

| AC | Observable rule / planned STS |
|---|---|
| AC-F07-01 | T-F07-01 API/DB: valid two distinct reviewer assignments; invalid/missing/self assignment503 with no insert |
| AC-F07-02 | T-F07-02 API/DB: stage1 approve→PENDING_FINAL, only final approve→APPROVED; ordered two events |
| AC-F07-03 | T-F07-03 API: noncurrent stage, requester, unrelated reviewer and anonymous denied with exact state/history unchanged |
| AC-F07-04 | T-F07-04 DB/E2E: current stage reject/return requires reason, owner can read actor/stage/reason |
| AC-F07-05 | T-F07-05 DB: return at either stage→owner edit/resubmit→stage1; old-round decision409 |
| AC-F07-06 | T-F07-06 real DB concurrency: two current-step decisions exactly one success; no duplicate event/final approval |
| AC-F07-07 | T-F07-07 migration integration: legacy terminal snapshots exact, open rows receive validated assignments, readback after restart |
| AC-F07-08 | T-F07-08 cross-feature/E2E: F-06 excludes intermediate totals; F-08 scopes/filter states and both reviewer views remain safe |

## Common response, safety and delivery rules

JSON errors use `{error:{code,message}}`. Invalid input 400 INVALID_INPUT; anonymous 401 UNAUTHENTICATED; wrong role 403 FORBIDDEN; hidden/unowned record 404 NOT_FOUND; invalid state/stale revision 409 INVALID_STATE. Browser writes require the existing exact Origin guard (403 FORBIDDEN_ORIGIN). Rejections never change protected data/history. Never accept owner/reviewer/status from client input. No secrets in JSON/logs/Git.

Each feature is implemented through an Issue, versioned contract/test-design commit, meaningful automated RED before production code, GREEN plus regression, peer-reviewed PR to sprint staging, integration and reviewed main release. Preserve actual command, SHA, runtime and pass/fail/skip output; no accepted/deployed claim before the corresponding gate. Real PostgreSQL persistence/access tests and selected browser journeys supplement unit tests. Existing synthetic fixtures and old history must survive additive migration; no shared DB reset/seed.

Definition of Done: every in-scope AC maps to an executed actual test/check with version/result, UI normal/loading/empty/error/pending/conflict behavior is verified, relevant negative/concurrent/persistence paths pass, contract revisions and implementation diff reviewed, CI/build/Docker pass, integrated main release and post-deploy check recorded. Planned AC never count as passed. Reviewer approval is not fabricated by the author or AI.
