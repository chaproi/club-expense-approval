# F-05 — Edit and resubmit returned requests

Contract v1.0 · 24 Nov 2026 · TH-038 · pre-implementation design

Issue: #36. Requirements: FR-05; BR-01, BR-05/06/09; NFR-01/02. Author: chaproi with AI assistance. Review: pending independent peer review.

## Feature SDS, workflow and layers

Depends on F-04. Only the owning Requester may save edits or resubmit while RETURNED. Save and resubmit are separate explicit actions: Save changes retains RETURNED; Resubmit changes to SUBMITTED. Request ID, assigned reviewer and all old events remain. A resubmission does not create another request. Future F-07 restarts stage one; that integration remains planned.

UI: display edit title/category/whole-baht amount and Save changes/Resubmit only on an owner RETURNED detail. Values initialize from current saved detail. Save success must be visible; disable resubmit when unsaved form values differ from the last saved detail so edits are not silently dropped. Pending writes disable all conflicting controls. Errors preserve editable input; conflict refreshes saved detail/list. Other states remain read-only.

API: PATCH `/api/expense-requests/:id` accepts exactly `{title,category,amountBaht,expectedRevision}`; POST `/:id/resubmit` accepts exactly `{expectedRevision}`. Both return 200 saved detail, increment revision once and append EDITED or RESUBMITTED event atomically. Validation matches existing BR-01 (trimmed title1–120 UTF-16 code units, existing categories, integer baht1–100000); existing title Unicode limitation is retained and disclosed. expectedRevision must be nonnegative int32 and current. Stale/wrong state409; hidden owner404; reviewer403. UI and all post-first-round decision calls send the returned revision.

Data: use F-04 revision/event migration, conditional owner+RETURNED+revision updates and event transaction. No second schema reset or owner/reviewer reassignment. Preserve createdAt and old event IDs/timestamps; updatedAt changes. Reject overflow rather than increment past int32.

## Justified contract revision

Original Sprint 1 AC-04/T-04 PATCH404 meant no edit endpoint existed. From this feature, replace only that obsolete endpoint expectation with a valid request against SUBMITTED→409 and exact unchanged data/history. Keep the original release identifiable; do not delete read-only/ownership checks or weaken tests. A partial invalid PATCH may now400; state protection is tested using a fully valid body.

## Acceptance criteria and STS

| AC | Observable outcome | Test / level / input → expected |
|---|---|---|
| AC-F05-01 | Owner saves valid fields on RETURNED; reads persisted values and EDITED event | T-F05-01 API/DB: return→PATCH rev1→200 rev2, same ID/assignment/createdAt, prior history preserved |
| AC-F05-02 | Invalid/forged edits leave record unchanged | T-F05-02 API/DB: baht0/1/100000/100001/decimal, title empty/120/121/NUL/surrogate, invalid category/extra status → appropriate200/400; negatives exact unchanged |
| AC-F05-03 | Only owner/RETURNED and exact Origin may edit/resubmit | T-F05-03 API/DB: other requester404, reviewer403, anonymous401, evil Origin403, SUBMITTED/APPROVED/REJECTED409; no protected mutation |
| AC-F05-04 | Resubmit is one atomic transition retaining old history | T-F05-04 API/DB: return→save→resubmit→SUBMITTED rev3 and RESUBMITTED event; later reviewer decide with rev3 succeeds |
| AC-F05-05 | Stale and concurrent saves/resubmits/old-round decisions fail safely | T-F05-05 API/DB: two same-revision writes exactly one200/one409; replay older revision409; legacy decision without revision after return/resubmit409; no duplicate event |
| AC-F05-06 | End-to-end user loop and persistence remain correct | T-F05-06 E2E: request→return→owner edit/save/resubmit→review→owner final history; app/Prisma restart readback exact |

## Common response, safety and delivery rules

JSON errors use `{error:{code,message}}`. Invalid input 400 INVALID_INPUT; anonymous 401 UNAUTHENTICATED; wrong role 403 FORBIDDEN; hidden/unowned record 404 NOT_FOUND; invalid state/stale revision 409 INVALID_STATE. Browser writes require the existing exact Origin guard (403 FORBIDDEN_ORIGIN). Rejections never change protected data/history. Never accept owner/reviewer/status from client input. No secrets in JSON/logs/Git.

Each feature is implemented through an Issue, versioned contract/test-design commit, meaningful automated RED before production code, GREEN plus regression, peer-reviewed PR to sprint staging, integration and reviewed main release. Preserve actual command, SHA, runtime and pass/fail/skip output; no accepted/deployed claim before the corresponding gate. Real PostgreSQL persistence/access tests and selected browser journeys supplement unit tests. Existing synthetic fixtures and old history must survive additive migration; no shared DB reset/seed.

Definition of Done: every in-scope AC maps to an executed actual test/check with version/result, UI normal/loading/empty/error/pending/conflict behavior is verified, relevant negative/concurrent/persistence paths pass, contract revisions and implementation diff reviewed, CI/build/Docker pass, integrated main release and post-deploy check recorded. Planned AC never count as passed. Reviewer approval is not fabricated by the author or AI.
