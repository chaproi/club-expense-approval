# Deliverable 2 completion and release checklist

Current status: **26 November 2026, Asia/Bangkok**. Released main **cc6b04c8e98191be591a3b755d25988148523909** (abbreviated R below). Technical completion is recorded; the owner's final D2 acceptance/submission decision is not.

## Actual Project Deliverable 2 rubric

These are the supplied rubric areas/weights, not marks awarded. The historical baseline's A–E section labels are not substituted for them.

| Rubric area | Evidence now available | Remaining before final PDF/submission |
|---|---|---|
| A Sprint 1 continuity and change status (5) | Corrected baseline43aa8d7; incoming Lab 6 defects and independent retest/acceptance at that version preserved; inherited cases pass in exact-main CI; deployed PD-A01/A03/A04/A06/A10 cover current auth/decisions/denials/readback. | Include the original evidence distinctions and known Low limitations; private Lab 6 archives remain separate, not new D2 UAT. |
| B Sprint 2 contracts and working increment (25) | Full F-04/F-05 SDS/API/data/AC/STS, meaningful original RED→GREEN and BF-01 correction, independent reviews #40/#41/#43, all16 per-AC mappings below, released R and live PD-A05/A07 demonstration. | Cover/declaration confirmed26Nov; final owner decision remains separate. Long reflection optional; do not manufacture RED. |
| C Sprint 3 contracts and working progress (15) | Full F-06/F-07/F-08 contracts included. F-06 count checkpoint AC01–04 working/released/CI-verified/live-scoped; approved totals, two-stage approval and filtering explicitly planned. | Present the dated Final plan; no claim that all Sprint3 is implemented. |
| D Updated requirements and test traceability (10) | Full SRS, inventory, System SDS, requirement matrix, per-AC implementation/test/result/version mapping, two real test excerpts and source hashes included in the report packet. | Exported PDF and inspection are documented in the packet; owner read-through/decision remains separate. |
| E Integrated release candidate (15) | Reviewed chain #39→#40→#41→#43→#45→#46→#47, release #48 approved on ecab746 and merged R; exact-main CI 47/19, build/Docker; migration/deploy and owner-directed live18 checks. | Owner's final acceptance; retain direct-cloud and pre-release snapshot limitations; review the report and submit only by owner action. |

Evidence: [deployment/live record](../evidence/deliverable-2/postdeploy-2026-11-26/evidence.md), [original independent Lab 6 status](../labs/lab-06/retest-status-2026-11-26.md), [report source packet](../reports/deliverable-2/README.md).

## Per-feature technical completion

| Feature | Implementation and review | Actual verification and provenance | Released state |
|---|---|---|---|
| F-01/F-02/F-03 continuity | Inherited authentication/owned requests/assigned decision; Sprint1 fixes retained | Lab6 independent43aa8d7 acceptance; exact-main R CI; live PD-P03/P04 and PD-A01/A03/A04/A06/A10 | R deployed; owner final D2 decision separate |
| F-04 | Return/reason/revision/history; reviewed #40/#41 | API T-F04-01–05, combined browser; exact-main CI PASS; PD-A05/A06 live subset | R |
| F-05 | RETURNED-only save/resubmit; account/request-scoped recovery; BF-01; reviewed #40/#41/#43 | API T-F05-01–06;16 recovery/BF-01 browser cases plus3 inherited journeys; exact-main CI PASS; PD-A05/A07 live | R |
| F-06 counts only | Single assigned-scope DB groupBy; safe zero bins and refetch; reviewed #40/#41 | API T-F06-01/02/03 and combined browser; exact-main CI PASS; PD-A08 live list-vs-summary/UI counts and V2 zeros | R |
| F-06 totals | Approved-category totals/final-stage semantics specified | AC-F06-05/06 unimplemented/unexecuted | PLANNED, not delivered |
| F-07 | Fixed two-stage contract/design reviewed #39 | AC-F07-01–08 unimplemented/unexecuted | PLANNED |
| F-08 | Authorized status-filter contract/design reviewed #39 | AC-F08-01–05 unimplemented/unexecuted | PLANNED |
| Dependency remedy | Scoped @prisma/config6.19.3 overrides; reviewed #45 | candidate a6c93ab clean install/audits/image migration/HTTP/populated upgrade; unchanged relevant inputs at R; exact-main CI generation/Docker PASS | R, override caveat retained |
| Campus UI | Four presentation/artwork paths; reviewed #47, breakpoint fix3426915 | local465ebea47/19; focused3426915 four widths; exact-main R CI; live desktop/390px/Reviewer768/reduced-motion/keyboard | R |

## Sprint 2 per-AC completion (16 ACs)

Exact paths: **API** = server/test/return-resubmit-summary.test.ts; **Journey** = client/test/expense-decisions.spec.ts, named T-F04-05/T-F05-06/T-F06-04; **Recovery** = client/test/f05-draft-recovery.spec.ts. These are existing assertions inspected in source, not coverage inferred only from filenames or totals. API implementation is server/src/expense-requests.ts plus expense-input.ts; recovery implementation is client/src/expense-requests.tsx. Every R cell means full SHA cc6b04c8e98191be591a3b755d25988148523909.

| AC | Implemented behavior | Actual automated assertion/evidence | Current result and live subset | Released main |
|---|---|---|---|---|
| AC-F04-01 | Assigned Reviewer returns with trimmed reason; one atomic event and owner read | API T-F04-01 exact status/reason/history; Journey | CI PASS; PD-A05 returned reason/history PASS | R |
| AC-F04-02 | Validate reason/revision/shape without writes | API T-F04-02 empty/301/NUL/surrogate/type/extra-field unchanged snapshot | CI PASS; those full boundary permutations were not rerun live | R |
| AC-F04-03 | Authentication/role/assignment/self/Origin | API T-F04-03 exact denied snapshots; inherited self policy | CI PASS; PD-P03/P04/A06 live denial subset PASS, no new live self-review fixture | R |
| AC-F04-04 | Terminal/repeat/race/overflow cannot append a transition | API T-F04-04 concurrent200/409 and preserved events/int32 limit | CI PASS; PD-A06 stale/terminal subset PASS; real race/exhaustion remain CI evidence | R |
| AC-F04-05 | Durable return/history and old records | API restart T-F04-05/T-F05-06; Journey; populated upgrade a6c93ab | CI PASS; PD-A05/A10 deployed readback PASS; no new service restart or exact pre-release shared snapshot | R |
| AC-F05-01 | Owner saves valid fields from RETURNED, EDITED event | API T-F05-01/04 exact ID/fields/revision/events; Journey | CI PASS; PD-A05/A07 explicit manual Save PASS | R |
| AC-F05-02 | Boundary/forged edits preserve fields/history | API T-F05-02 invalid/forged shapes with exact snapshots | CI PASS; full boundary matrix not repeated live | R |
| AC-F05-03 | Owner/role/state/Origin and revision maximum | API T-F05-03 deny edit/resubmit; inherited T-04 SUBMITTED remains409 | CI PASS; PD-A06 wrong principal/terminal/Origin subset PASS | R |
| AC-F05-04 | Explicit Resubmit same request; retained assignment/old history | API T-F05-01/04; current-revision decision in T-F05-05; Journey | CI PASS; PD-A05 full five-event deployed sequence PASS | R |
| AC-F05-05 | Optimistic concurrency and old-round rejection | API T-F05-05 concurrent edits/resubmits and edit-vs-resubmit, exact200/409/events | CI PASS; PD-A06/A07 genuine stale responses PASS; concurrent race remains CI evidence | R |
| AC-F05-06 | Correction/resubmit state survives app/client reconstruction | API restart; Journey checks dirty-resubmit blocking and final DB state | CI PASS; PD-A05/A10 browser reload/readback PASS, not a new server restart | R |
| AC-F05-07 | Real409 retains separate attempted draft/latest and conflicts | Recovery T-F05-07 two owner sessions; exact saved DB state | CI PASS; PD-A07 real live409/latest/draft/title marker PASS | R |
| AC-F05-08 | Restore only changed fields; Discard/read controls no write; manual Save | Recovery T-F05-08a category/amount untouched and T-F05-08b Discard; BF-01 same-value/reverted draft | CI PASS; PD-A07 Restore0 writes and manual Save PASS; live Discard/BF-01 not repeated | R |
| AC-F05-09 | Per-account/request memory lifecycle; read-only/denied access clearing | Recovery T-F05-09a/b, real revoked/hidden access, same-tab switch and separate reload; BF-01 cleanup | CI PASS; PD-A01 logout/revocation and A07 successful-save cleanup live subset PASS | R |
| AC-F05-10 | Failed refresh keeps draft, GET-only retry, repeated conflict | Recovery T-F05-10a/b exact write count/state; controlled transport abort clearly labelled | CI PASS; local465ebea verification retained; no live injected outage/repeated-conflict claim | R |
| AC-F05-11 | Save/Resubmit transport errors are action-specific, input retained | Recovery T-F05-11a/b controlled abort and unchanged DB snapshots | CI PASS; no live transport injection in postdeploy checks | R |

### Sprint 3 count checkpoint and planned ACs

| AC | Actual implementation / verification | Result / released main |
|---|---|---|
| AC-F06-01 | groupBy assigned scope; API T-F06-01/02/03 + transition counts; Journey; PD-A08 independent list counts | CI/live PASS, R |
| AC-F06-02 | Reviewer-only API; API401/403 and other-reviewer data; PD-P03/A06/A08 | CI/live PASS, R |
| AC-F06-03 | Explicit zero bins and app/client reconstruction API; PD-A08 V2 all zeros | CI PASS; live zero subset PASS, R; no live server restart |
| AC-F06-04 | DB-derived UI/refetch; Journey; PD-A08 values, live decision changes and PD-A09 final summary | CI/live PASS, R; full transient matrix is limited to documented observations |
| AC-F06-05 | Approved-category totals | PLANNED, no implementation/test/release |
| AC-F06-06 | Two-stage scope/intermediate-state totals | PLANNED, depends F-07 |
| AC-F07-01–08 | Full planned two-stage AC/STS in contract | PLANNED, 8 ACs unexecuted |
| AC-F08-01–05 | Full planned authorized-filter AC/STS in contract | PLANNED, 5 ACs unexecuted |

Exact-main [run45786768391](https://github.com/chaproi/club-expense-approval/actions/runs/45786768391):47/47 API,19/19 browser, zero failed/skipped; build/Docker PASS. These same mapped assertions were run on released main R. Earlier local465ebea and3426915 evidence is not relabelled. Owner-directed live18 checks are a bounded representative subset, not a second execution of every source AC case.

## Current release and report checklist

- [x] Actual independent source reviews and reviewed staging chain recorded.
- [x] #48 approved on ecab746; main R merged; no source approval fabricated.
- [x] Exact-main CI47/19, TypeScript/build/Docker passed.
- [x] Required migration execution succeeded before service update; revision/digest and log-reported traffic recorded.
- [x] Owner-directed live auth/workflow/denial/draft/count/layout checks18 PASS; earlier harness failure preserved.
- [x] Lab6 original incoming UAT/retest/accepted Low limitations reconciled separately.
- [x] Per-feature/per-AC completion and full source packet prepared with actual demonstrations and test excerpts.
- [x] Student confirmed cover name นายสิริกร ฝันนิมิตร / ID67070507215 / TH-038 Solo instructor-approved and the concise contribution/AI-use declaration on26Nov. A long personal reflection is optional.
- [x] Corrected report PDF includes the consolidated finding register, executable local setup,29Nov Lab7 deadline and named AI tools; updated pagination/navigation and every-page inspection are recorded in the current PDF QA. The prior7b0194d result remains historical. Owner checks course-required naming before submission.
- [ ] Owner records final D2 acceptance decision and performs submission.

There is **no new external deployed-acceptance checkbox** for D2. Technical checks do not assign marks or substitute for the owner. Direct-cloud current imageDigest/traffic/task queries and exact pre-release shared-data snapshots remain explicitly unavailable, not silently converted to PASS.

## Remaining work through 13 December (plan dated 26 Nov)

| Date (Asia/Bangkok) | Planned work / evidence | Decision/dependency |
|---|---|---|
| 27–29 Nov | Confirmed student text and report PDF; owner packet review and D2 submission by29Nov23:59, target20:00 | Owner action; do not claim submission now |
| By29Nov | Track the separate Lab7 maintenance deliverable and obtain instructor/TA scope approval; reconcile any separate Lab6 report/reciprocal material | Actual Lab7 deadline29Nov; no extension or approval claimed. Preserve existing UAT. Lab7 completion is separate from the owner's D2 decision, not a new prerequisite for D2 acceptance. |
| By2Dec | Implement/test-first F-07 two-stage with validated distinct assignments, per-round concurrency and legacy migration | Reviewed contract; exams1–11Dec constrain capacity |
| By3Dec | Implement/test-first F-08 authorized status filters and intermediate state | Depends compatible F-07 scope/status |
| By4Dec | Complete F-06 approved-category totals and no double count/intermediate approval | Depends F-07 |
| 5–7Dec | Integrated correctness/security/data-upgrade/recovery and responsive/accessibility hardening | Actual gaps only; preserve failures |
| 8–10Dec | Planned Final UAT and dispositions, if required by Final/course handoff | Separate Final activity, not retroactive D2 gate |
| 11–12Dec | Reviewed Final release/deployment, video/report, remaining evidence | Only after source/release gates |
| 13Dec | Owner final submission | No current acceptance/submission claim |

Owner: chaproi. Peer availability and future results are not assumed. No full Sprint3 completion, Lab7 approval or future execution is claimed.
