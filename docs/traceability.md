# Full requirement-to-verification matrix — initial design

24 Nov 2026. Includes every baseline FR/BR and important NFR. No new test has run at this design commit. Historical passing tests are not candidate passing evidence.

| Requirement / description | Feature / sprint | AC / planned verification | Actual evidence / result / version |
|---|---|---|---|
| FR-01: ผู้ใช้ล็อกอิน ตรวจบัญชีปัจจุบัน และออกจากระบบได้ | F-01 / 1 | AC-01–03 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| FR-02: Requester ส่งคำขอและเปิดรายการ รายละเอียด และประวัติของตนได้ | F-02 / 1 | AC-04–06 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| FR-03: Reviewer เปิดคำขอที่ได้รับมอบหมายและอนุมัติหรือปฏิเสธได้ ผู้ขอเห็นผลที่บันทึกไว้ | F-03 / 1 | AC-06–08 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| BR-01: รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม 1–100,000 บาท | F-02 / 1 | AC-04–05 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| BR-02: สร้างคำขอในสถานะ SUBMITTED และมอบหมาย Reviewer ฝั่งเซิร์ฟเวอร์ | F-02 / 1 | AC-04 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| BR-03: ผู้ตัดสินต้องเป็น Reviewer ที่ได้รับมอบหมายและคนละบัญชีกับผู้ขอ | F-03 / 1 | AC-06, AC-09 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| BR-04: Sprint 1 ตัดสินได้จาก SUBMITTED ครั้งเดียว และบันทึกสถานะกับเหตุการณ์ใน transaction เดียว | F-03 / 1 | AC-07, AC-08, AC-10 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| NFR-01: ทุก API ที่คุ้มครองปฏิเสธ anonymous และบังคับใช้ role/ownership โดยไม่คืนข้อมูลของคำขอนอกสิทธิ์ | F-01, F-02, F-03 / 1 | AC-03, AC-06, AC-09 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| NFR-02: เปิดอ่านคำขอและประวัติจาก PostgreSQL ได้หลังสร้างแอปใหม่ด้วยฐานเดิม และตรวจซ้ำหลัง deploy ใน Lab 5 | F-02, F-03 / 1 | AC-08 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| FR-04: Reviewer ส่งคำขอกลับให้แก้และบันทึกเหตุผลที่ผู้ขอเปิดดูได้ | F-04 / 2 | AC-F04-* / T-F04-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| FR-05: Requester แก้รายละเอียดของคำขอที่ถูกส่งกลับและส่งใหม่ โดยยังเห็นประวัติรอบก่อน | F-05 / 2 | AC-F05-* / T-F05-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| BR-05: ส่งกลับได้จาก SUBMITTED และส่งใหม่ได้โดยเจ้าของจาก RETURNED เท่านั้น | F-04, F-05 / 2 | AC-F04-* / T-F04-* in its contract; AC-F05-* / T-F05-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| BR-06: ผู้ขอแก้หรือส่งใหม่ได้เฉพาะเมื่อเป็นเจ้าของคำขอในสถานะ RETURNED ซึ่งเริ่มรองรับใน Sprint 2 คำขอที่ส่งแล้วจึงอ่านได้อย่างเดียวสำหรับผู้ขอใน Sprint 1 | F-02, F-05 / 1, 2 | AC-F05-* / T-F05-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| BR-07: ผู้ตรวจต้องระบุเหตุผลปฏิเสธ 1–300 ตัวอักษรหลัง trim และผู้ขอต้องอ่านเหตุผลได้จากประวัติ | F-03 / 1 | AC-07 / historical server/test and client/test mappings | Historical main43aa8d7; candidate continuity pending |
| FR-06: Reviewer ดูจำนวนคำขอตามสถานะและยอดอนุมัติแยกหมวดจากคำขอที่ตนรับผิดชอบได้ | F-06 / 3 | AC-F06-* / T-F06-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| FR-07: ระบบส่งคำขอผ่านผู้ตรวจเบื้องต้นและผู้อนุมัติขั้นสุดท้ายตามลำดับ ผู้ขอเห็นสถานะและผลแต่ละขั้นในประวัติ | F-07 / 3 | AC-F07-* / T-F07-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| FR-08: Requester และ Reviewer กรองรายการคำขอที่ตนมีสิทธิ์ตามสถานะ หรือเลือกดูทุกสถานะได้ | F-08 / 3 | AC-F08-* / T-F08-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| BR-08: ระบบกำหนดผู้ตรวจสองบัญชีที่ต่างกันและต่างจากผู้ขอ ให้เฉพาะผู้ตรวจขั้นปัจจุบันตัดสินได้ และสถานะ APPROVED เกิดเมื่อขั้นสุดท้ายอนุมัติ | F-07 / 3 | AC-F07-* / T-F07-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| BR-09: ผู้ตรวจในขั้นปัจจุบันปฏิเสธหรือส่งกลับได้โดยมีเหตุผล เจ้าของแก้และส่งใหม่ได้เฉพาะจาก RETURNED และเริ่มตรวจขั้นแรกอีกครั้งโดยคงประวัติเดิม | F-04, F-05, F-07 / 2, 3 | AC-F04-* / T-F04-* in its contract; AC-F05-* / T-F05-* in its contract; AC-F07-* / T-F07-* in its contract | Planned new AC; actual file/test/result/SHA pending |
| BR-10: API จำกัดผลตามเจ้าของหรือผู้ตรวจที่ได้รับมอบหมายก่อนคืนรายการที่ตรงตัวกรอง การเลือกทุกสถานะยังใช้สิทธิ์เดิม | F-08 / 3 | AC-F08-* / T-F08-* in its contract | Planned new AC; actual file/test/result/SHA pending |

Cross-cutting NFR-01 also maps to every new feature access path; NFR-02 maps to new state/history/summary persistence and deployment. Actual rows must name specific tests once written; wildcard design mappings do not count as executed coverage. NFR sources/measurements and uncovered Final checks remain explicit.
