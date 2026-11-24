# Full requirement-to-verification matrix — current candidate

24 Nov 2026. All baseline FR/BR and important NFR retained. Initial design was committed before code in c7539ee; this revision adds actual test/file mappings. PASS below means source verification, with independent review/main/deployment still pending. Version evidence is in the hosted/local ledger; planned Final tests are never counted as executed.

| Requirement / description | Feature / sprint | AC / planned verification | Actual evidence / result / version |
|---|---|---|---|
| FR-01: ผู้ใช้ล็อกอิน ตรวจบัญชีปัจจุบัน และออกจากระบบได้ | F-01 / 1 | AC-01–03 / historical server/test and client/test mappings | server/test/auth.test.ts T-01/02/03 + DEF-TH038-01; canonical-origin.test.ts DEF-TH038-02; client/test/expense-decisions.spec.ts original journeys; PASS |
| FR-02: Requester ส่งคำขอและเปิดรายการ รายละเอียด และประวัติของตนได้ | F-02 / 1 | AC-04–06 / historical server/test and client/test mappings | server/test/expense-requests.test.ts T-04/05/06/08; client/test/expense-decisions.spec.ts T-09; PASS |
| FR-03: Reviewer เปิดคำขอที่ได้รับมอบหมายและอนุมัติหรือปฏิเสธได้ ผู้ขอเห็นผลที่บันทึกไว้ | F-03 / 1 | AC-06–08 / historical server/test and client/test mappings | server/test/expense-requests.test.ts T-07/08/10/11; expense-decision.test.ts T-07/10; both original browser journeys; PASS |
| BR-01: รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม 1–100,000 บาท | F-02 / 1 | AC-04–05 / historical server/test and client/test mappings | server/test/expense-input.test.ts T-05; expense-requests.test.ts T-05; return-resubmit-summary.test.ts T-F05-02; PASS (UTF-16 limitation disclosed) |
| BR-02: สร้างคำขอในสถานะ SUBMITTED และมอบหมาย Reviewer ฝั่งเซิร์ฟเวอร์ | F-02 / 1 | AC-04 / historical server/test and client/test mappings | server/test/expense-requests.test.ts T-04/05 and assignment configuration failure test; PASS |
| BR-03: ผู้ตัดสินต้องเป็น Reviewer ที่ได้รับมอบหมายและคนละบัญชีกับผู้ขอ | F-03 / 1 | AC-06, AC-09 / historical server/test and client/test mappings | server/test/expense-requests.test.ts T-06/T-10; expense-decision.test.ts T-10; return-resubmit-summary.test.ts T-F04-03; PASS |
| BR-04: Sprint 1 ตัดสินได้จาก SUBMITTED ครั้งเดียว และบันทึกสถานะกับเหตุการณ์ใน transaction เดียว | F-03 / 1 | AC-07, AC-08, AC-10 / historical server/test and client/test mappings | server/test/expense-requests.test.ts T-11; return-resubmit-summary.test.ts T-F04-04/T-F05-05; one decision per current SUBMITTED revision; PASS |
| NFR-01: ทุก API ที่คุ้มครองปฏิเสธ anonymous และบังคับใช้ role/ownership โดยไม่คืนข้อมูลของคำขอนอกสิทธิ์ | F-01, F-02, F-03 / 1 | AC-03, AC-06, AC-09 / historical server/test and client/test mappings | server/test/auth.test.ts T-02/03 and Origin; expense-requests.test.ts T-03/06/10; return-resubmit-summary.test.ts T-F04-03/T-F05-03/T-F06-02; PASS |
| NFR-02: เปิดอ่านคำขอและประวัติจาก PostgreSQL ได้หลังสร้างแอปใหม่ด้วยฐานเดิม และตรวจซ้ำหลัง deploy ใน Lab 5 | F-02, F-03 / 1 | AC-08 / historical server/test and client/test mappings | server/test/expense-requests.test.ts T-08; return-resubmit-summary.test.ts restart T-F04-05/T-F05-06/T-F06-03; migration-compatibility.json; PASS isolated real PostgreSQL; deployed readback pending |
| FR-04: Reviewer ส่งคำขอกลับให้แก้และบันทึกเหตุผลที่ผู้ขอเปิดดูได้ | F-04 / 2 | AC-F04-* / T-F04-* in its contract | return-resubmit-summary.test.ts T-F04-01–05; browser T-F04-05/T-F05-06/T-F06-04; PASS; #35 / PR40+41 |
| FR-05: Requester แก้รายละเอียดของคำขอที่ถูกส่งกลับและส่งใหม่ โดยยังเห็นประวัติรอบก่อน | F-05 / 2 | AC-F05-* / T-F05-* in its contract | return-resubmit-summary.test.ts T-F05-01–06; same combined browser journey; PASS; #36 / PR40+41 |
| BR-05: ส่งกลับได้จาก SUBMITTED และส่งใหม่ได้โดยเจ้าของจาก RETURNED เท่านั้น | F-04, F-05 / 2 | AC-F04-* / T-F04-* in its contract; AC-F05-* / T-F05-* in its contract | return-resubmit-summary.test.ts T-F04-04/T-F05-03/04/05; PASS current single-stage subset |
| BR-06: ผู้ขอแก้หรือส่งใหม่ได้เฉพาะเมื่อเป็นเจ้าของคำขอในสถานะ RETURNED ซึ่งเริ่มรองรับใน Sprint 2 คำขอที่ส่งแล้วจึงอ่านได้อย่างเดียวสำหรับผู้ขอใน Sprint 1 | F-02, F-05 / 1, 2 | AC-F05-* / T-F05-* in its contract | expense-requests.test.ts revised T-04; return-resubmit-summary.test.ts T-F05-01/02/03; PASS |
| BR-07: ผู้ตรวจต้องระบุเหตุผลปฏิเสธ 1–300 ตัวอักษรหลัง trim และผู้ขอต้องอ่านเหตุผลได้จากประวัติ | F-03 / 1 | AC-07 / historical server/test and client/test mappings | expense-decision.test.ts T-07; expense-requests.test.ts T-07; browser T-09 rejection validation/reason readback; PASS |
| FR-06: Reviewer ดูจำนวนคำขอตามสถานะและยอดอนุมัติแยกหมวดจากคำขอที่ตนรับผิดชอบได้ | F-06 / 3 | AC-F06-* / T-F06-* in its contract | return-resubmit-summary.test.ts T-F06-01/02/03; browser T-F06-04; counts PASS; AC-F06-05/06 category sums and two-stage semantics PLANNED |
| FR-07: ระบบส่งคำขอผ่านผู้ตรวจเบื้องต้นและผู้อนุมัติขั้นสุดท้ายตามลำดับ ผู้ขอเห็นสถานะและผลแต่ละขั้นในประวัติ | F-07 / 3 | AC-F07-* / T-F07-* in its contract | contracts/f-07-two-stage.md AC-F07-01–08 / T-F07-01–08: PLANNED, not executed |
| FR-08: Requester และ Reviewer กรองรายการคำขอที่ตนมีสิทธิ์ตามสถานะ หรือเลือกดูทุกสถานะได้ | F-08 / 3 | AC-F08-* / T-F08-* in its contract | contracts/f-08-status-filter.md AC-F08-01–05 / T-F08-01–05: PLANNED, not executed |
| BR-08: ระบบกำหนดผู้ตรวจสองบัญชีที่ต่างกันและต่างจากผู้ขอ ให้เฉพาะผู้ตรวจขั้นปัจจุบันตัดสินได้ และสถานะ APPROVED เกิดเมื่อขั้นสุดท้ายอนุมัติ | F-07 / 3 | AC-F07-* / T-F07-* in its contract | contracts/f-07-two-stage.md AC-F07-01/02/03/06: PLANNED, not executed |
| BR-09: ผู้ตรวจในขั้นปัจจุบันปฏิเสธหรือส่งกลับได้โดยมีเหตุผล เจ้าของแก้และส่งใหม่ได้เฉพาะจาก RETURNED และเริ่มตรวจขั้นแรกอีกครั้งโดยคงประวัติเดิม | F-04, F-05, F-07 / 2, 3 | AC-F04-* / T-F04-* in its contract; AC-F05-* / T-F05-* in its contract; AC-F07-* / T-F07-* in its contract | return-resubmit-summary.test.ts T-F04-01–04/T-F05-01/03/04/05: single-stage subset PASS; stage-reset/either-stage AC-F07-04/05 PLANNED |
| BR-10: API จำกัดผลตามเจ้าของหรือผู้ตรวจที่ได้รับมอบหมายก่อนคืนรายการที่ตรงตัวกรอง การเลือกทุกสถานะยังใช้สิทธิ์เดิม | F-08 / 3 | AC-F08-* / T-F08-* in its contract | contracts/f-08-status-filter.md AC-F08-01/02/03/05: PLANNED; original unfiltered role/ownership T-06 remains PASS |


## Exact feature AC → executed test mapping

All API identifiers below name tests in `server/test/return-resubmit-summary.test.ts`; browser journey is the exact named test `T-F04-05/T-F05-06/T-F06-04: return, saved correction, resubmit and final readback update the DB summary` in `client/test/expense-decisions.spec.ts`.

| Contract AC | Actual API/DB test | UI / scope note |
|---|---|---|
| AC-F04-01 | T-F04-01 | Combined browser journey: persisted reason and owner readback |
| AC-F04-02 | T-F04-02 | Invalid reason/revision/extra fields leave exact snapshot unchanged |
| AC-F04-03 | T-F04-03 | Anonymous/role/assignment/Origin and explicit self-return denial |
| AC-F04-04 | T-F04-04 | Terminal/repeat/race/int32-exhaustion rejection |
| AC-F04-05 | restart T-F04-05/T-F05-06; migration-compatibility.json | Combined browser journey and retained return screenshot |
| AC-F05-01 | T-F05-01/04 | Saved corrected fields and EDITED event |
| AC-F05-02 | T-F05-02 | Boundary/forged negatives exact unchanged snapshot |
| AC-F05-03 | T-F05-03 | Role/owner/state/Origin and revision exhaustion |
| AC-F05-04 | T-F05-01/04 plus T-F05-05 current-revision decision | Same request/history; resubmit then approve |
| AC-F05-05 | both T-F05-05 tests | Same-revision edit/edit, resubmit/resubmit, edit/resubmit and old-round replay |
| AC-F05-06 | restart T-F04-05/T-F05-06 | Combined browser journey, dirty resubmit disabled, final persisted DB event sequence |
| AC-F06-01 | T-F06-01/02/03 plus transition T-F06-01 | Exact DB counts/refetch after changes |
| AC-F06-02 | T-F06-01/02/03 | Anonymous/Requester denied; other reviewer data isolated; requester UI absent |
| AC-F06-03 | T-F06-03 | Explicit zero states/empty and new app/client readback |
| AC-F06-04 | API above plus combined browser journey | Real summary values refreshed after return/final approval; loading/error/pending manual review still required |
| AC-F06-05/06 | Planned T-F06-05/06 | Not implemented/executed; Final work |

## F-05 v1.1 planned verification

The FR-05 and dependent business-rule PASS evidence above applies to the original AC-F05-01 through AC-F05-06. Scope and dispositions for the follow-up are documented in the [F-05 v1.1 contract](contracts/f-05-edit-resubmit.md#v11-draft-recovery-ac-and-system-test-specifications) and [staging triage](evidence/deliverable-2/f05-draft-recovery-triage.md). Track the correction in [Issue #42](https://github.com/chaproi/club-expense-approval/issues/42), related to the original [Issue #36](https://github.com/chaproi/club-expense-approval/issues/36).

| Contract AC | Proposed STS | Status |
|---|---|---|
| AC-F05-07 | T-F05-07: stale Save, separate draft and latest detail, overlap indicators | Planned / unexecuted |
| AC-F05-08 | T-F05-08a/b: explicit Restore/Discard and current-revision manual Save | Planned / unexecuted |
| AC-F05-09 | T-F05-09a/b: read-only state changes, access, request/account scope and draft lifetime | Planned / unexecuted |
| AC-F05-10 | T-F05-10a/b: failed refresh, read-only retry and repeated conflict | Planned / unexecuted |
| AC-F05-11 | T-F05-11a/b: Save/Resubmit error feedback and unchanged persisted state | Planned / unexecuted |

Dependency-audit disposition and populated Sprint 1 database upgrade verification remain separate release gates. The fresh staging test database does not establish migration preservation for existing data.

Version/result provenance: baseline34/34; meaningful new RED0/13; GREEN47/47; hosted run45237202381 at830346b has47/47 API and3/3 browser, build/Docker PASS. Later explicit self/overflow assertions: final-api-verification.log47/47 local PASS; latest PR41 exact-head CI must also pass. Peer manual inspection of new UI loading/empty/error/pending/conflict states and deployed persistence remains a release gate, not assumed from a happy-path screenshot.
