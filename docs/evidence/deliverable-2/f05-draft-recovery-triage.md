# F-05 draft recovery triage and test design

25 Nov 2026 · TH-038 · documentation and test design for review

Follow-up [defect Issue #42](https://github.com/chaproi/club-expense-approval/issues/42) to the original [F-05 Issue #36](https://github.com/chaproi/club-expense-approval/issues/36). The proposed rules are in [F-05 v1.1](../../contracts/f-05-edit-resubmit.md#save-conflict-and-draft-recovery-v11). The [traceability entries](../../traceability.md#f-05-v11-planned-verification) are Planned / unexecuted.

## Observations on integrated staging

- **Medium — draft loss on stale Save.** Tested `staging/sprint-2` at [`ed06b112e8a61890b10daaf76ddbd9632f77c88c`](https://github.com/chaproi/club-expense-approval/commit/ed06b112e8a61890b10daaf76ddbd9632f77c88c). The supplemental browser probe used the bundled app, Chromium 151.0.7922.34 and isolated PostgreSQL 17.12. A real 409 protected the persisted record. The UI then showed the latest saved title and lost the attempted title.
- **Low — misleading Save error.** A separate controlled browser transport abort before delivery kept the attempted fields and left the record unchanged. The feedback read `Could not save the decision.` That was a transport test. The shared fallback also appears on the Resubmit path in [the component](../../../client/src/expense-requests.tsx); a Resubmit transport failure was not observed in staging acceptance.
- The local acceptance ledger records `npm.cmd test` (47/47), `npm.cmd run test:e2e` (3/3), and separate UI observations (6/6), along with successful builds. The UI observations passed their then-existing assertions, which included the observation that stale draft values were replaced. The defect comes from that observed behavior. The new AC and STS have not been run. [Historical Deliverable 2 evidence](verification.md) retains its original tested revisions and results.

### Reproduction from the staging probe

1. With two real sessions for the same Requester, open a request that the assigned Reviewer returned for correction. In session A edit the title without saving.
2. In session B save a different title at the loaded revision and confirm HTTP 200. In A press **Save changes** using the earlier revision.
3. Observe HTTP `409 INVALID_STATE`, the conflict alert and refreshed detail and list. Re-read the record independently. The newer revision and history remain exactly as B saved them; A adds no event. A's typed title disappears when the form loads the saved title.
4. Separately, abort one otherwise valid Save request at the browser before delivery. Observe the generic decision wording, retained typed fields and unchanged saved record. This abort does not reproduce a backend failure.

### Cause and decision

F-05 v1.0 called for retaining editable input after errors and refetching saved detail/list after a conflict. It did not define where the conflicted draft lives, which fields Restore should stage, the read-only outcome after a state change, or when drafts expire. In `ExpenseDetail.mutate`, the 409 branch clears detail and dirty state. The form key includes the request ID and revision; when the newest revision renders, uncontrolled inputs initialize from the saved value. Server-side conflict behavior already protects the record.

Proposed v1.1 keeps the authoritative saved snapshot and the attempted draft distinct, with a changed-field set and a visible same-field comparison. The Requester can Restore only their own changed fields or explicitly Discard. Reapply only within this tab and account; fresh authorization and a deliberate Save are still required. A concurrent write between refresh and Save is handled by the same revision guard and a new recovery cycle.

## Impact and proposed verification

| Layer / finding | Decision | Affected files in a later batch | Proof to collect |
|---|---|---|---|
| F-05 UI, FR-05 and BR-05/06 | Add request/account-scoped tab-memory draft handling, accessible conflict/diff/retry controls, reload warning and action-specific error wording. | `client/src/expense-requests.tsx` in the Requester list/detail path; focused browser coverage in `client/test/expense-decisions.spec.ts` or a dedicated sibling. | AC-F05-07–11. Prove that refresh, Restore, Discard and retry read without issuing any writes; separately verify explicit Save uses the current revision. |
| API and auth | Reuse existing authorized list/detail reads, PATCH Save and POST Resubmit. A stale write returns 409; state/authorization guards are already enforced. | `server/src/expense-requests.ts` and `server/test/return-resubmit-summary.test.ts` are regression references. No change is proposed. | Check true 409 and exact persisted snapshots, plus existing wrong-role, cross-owner, Origin and race checks. A browser transport fault only tests UI behavior. |
| Data | Keep drafts client-side. Current revision, state, request ID and atomic history writes already support the protocol. | No schema, migration or seed edits are proposed. | Independent Prisma readback of revision, status, title/category/amount and full history. A rejected write adds no event. A deliberate successful Save adds one EDITED event. |

Design the RED batch with real sessions and isolated PostgreSQL, using response/render synchronization. Start with T-F05-07, T-F05-08a and the action-error assertions. On v1.0, the stale-write and no-mutation assertions should pass; the retained-draft and restoration assertions should fail. The shared Save/Resubmit fallback is expected to fail the new action-specific message checks. These are predictions. Record actual RED only after executing against unchanged production. Then implement the smallest UI correction, rerun the focused browser cases and the existing regression suites, and retain true command results and revision provenance.

## Separate release gates

- **Dependency audit.** The staging triage recorded four High npm entries from two underlying advisories, [deepmerge-ts](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) and [Effect](https://github.com/advisories/GHSA-7589-6fvf-x4pw). CLI dependency loading was observed. App-level reachability and a compatible version addressing both have not been verified. Keep disposition and dependency changes separate from F-05.
- **Existing-data upgrade.** The integrated staging run migrated an empty database. Keep the [historical additive-migration result](migration-compatibility.json) at its historical scope. Before release, apply the candidate migration to an isolated database populated under the approved Sprint 1 schema. Compare IDs, assignments, fields, timestamps and events, verify the revision backfill, and read the retained workflow after restart. This rehearsal remains pending for the integrated candidate.
