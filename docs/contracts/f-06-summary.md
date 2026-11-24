# F-06 — Permission-scoped decision summary

Contract v1.0 · 24 Nov 2026 · TH-038 · pre-implementation design

Issue: #37. Requirements: FR-06; NFR-01/02; F-05 checkpoint / F-07 final dependency. Author: chaproi with AI assistance. Review: pending independent peer review.

## Feature SDS, workflow and layers

Scope the summary to requests assigned to the signed-in Reviewer before aggregating. Counts are current requests, not history events, and each request counts once. The 29 November increment implements status counts; category totals are specified below but remain planned until implemented and tested. Do not call full F-06 accepted from partial progress.

UI: Reviewer-only Status summary with an explicit label for every count, loading/empty/error behavior, zero counts and refresh after decisions. Requester has no summary controls. Counts must come from API/DB, not from a cached list or hardcoded display values.

API checkpoint: GET `/api/expense-requests/summary` before dynamic `/:id` route. Reviewer200 `{counts:{SUBMITTED,RETURNED,APPROVED,REJECTED},total}`; each value nonnegative integer and total equals sum. One grouped DB query scoped by assignedReviewerId supplies a consistent result. Anonymous401 / Requester403. No arbitrary owner/reviewer query parameter accepted. No user/email/hidden-request detail returned.

Data: no migration for counts; GROUP BY current status on ExpenseRequest, with the existing assignment predicate. RETURNED is zero on pre-F04 schema and populated when integrated. Repeated return/resubmit cannot inflate total. Unknown future statuses require a versioned contract extension, not silent omission.

Final planned API extension: add `approvedAmountByCategory` for EQUIPMENT/ACTIVITY/TRAVEL, integer baht, only final APPROVED requests counted once. Under F-07, responsibility is the permitted assigned-reviewer scope (both assigned stages where allowed), never a join that doubles a request. PENDING_FINAL is a distinct non-approved count. Scope/security and reporting consistency must be tested before accepting those AC.

## Acceptance criteria and STS

| AC | Outcome | Test / level / expected | Checkpoint status |
|---|---|---|---|
| AC-F06-01 | Real DB status counts and total reflect current assigned requests once | T-F06-01 API/DB: known seeded counts and other-reviewer fixtures→exact aggregate; return/edit/resubmit do not inflate total | Planned until executed |
| AC-F06-02 | Anonymous/Requester denied and cross-reviewer data excluded | T-F06-02 API/DB:401/403; unrelated reviewer zero/own counts only; no private DTO fields | Planned until executed |
| AC-F06-03 | Zero states/empty set and restart readback correct | T-F06-03 API/DB: empty scope all zeros; app/Prisma restart→same counts | Planned until executed |
| AC-F06-04 | Reviewer UI displays/refetches actual summary safely | T-F06-04 E2E: return/resubmit/decision→expected displayed counts; requester no summary | Planned until executed |
| AC-F06-05 | Approved integer amounts grouped by category without double counting | T-F06-05 API/DB: known approved amounts plus rejected/returned/intermediate approvals→exact final sums | Final work, not implemented in count-only checkpoint |
| AC-F06-06 | F-07 scopes and PENDING_FINAL semantics preserve reporting correctness | T-F06-06 cross-feature DB/E2E: two reviewers and resubmitted round→no double count/no unauthorized totals | Final work, depends F-07 |

## Common response, safety and delivery rules

JSON errors use `{error:{code,message}}`. Invalid input 400 INVALID_INPUT; anonymous 401 UNAUTHENTICATED; wrong role 403 FORBIDDEN; hidden/unowned record 404 NOT_FOUND; invalid state/stale revision 409 INVALID_STATE. Browser writes require the existing exact Origin guard (403 FORBIDDEN_ORIGIN). Rejections never change protected data/history. Never accept owner/reviewer/status from client input. No secrets in JSON/logs/Git.

Each feature is implemented through an Issue, versioned contract/test-design commit, meaningful automated RED before production code, GREEN plus regression, peer-reviewed PR to sprint staging, integration and reviewed main release. Preserve actual command, SHA, runtime and pass/fail/skip output; no accepted/deployed claim before the corresponding gate. Real PostgreSQL persistence/access tests and selected browser journeys supplement unit tests. Existing synthetic fixtures and old history must survive additive migration; no shared DB reset/seed.

Definition of Done: every in-scope AC maps to an executed actual test/check with version/result, UI normal/loading/empty/error/pending/conflict behavior is verified, relevant negative/concurrent/persistence paths pass, contract revisions and implementation diff reviewed, CI/build/Docker pass, integrated main release and post-deploy check recorded. Planned AC never count as passed. Reviewer approval is not fabricated by the author or AI.
