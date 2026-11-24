# Current product SRS — Deliverable 2 working baseline

v0.4-design · 24 Nov 2026 · contract revision before implementation; acceptance pending


ชมรมนักศึกษาต้องการให้สมาชิกส่งคำขอเบิกและกลับมาดูผลได้จากที่เดียว เหรัญญิกต้องรู้ว่าต้องตรวจคำขอไหนและเคยตัดสินอย่างไร ระบบรองรับชมรมเดียวและคำขอละหนึ่งรายการ Sprint 1–2 ใช้ผู้ตรวจหนึ่งคนต่อคำขอ เมื่อส่ง Final ระบบต้องมีการอนุมัติสองขั้นและตัวกรองรายการคำขอตามสถานะ

- **Requester** สมาชิกที่ส่งคำขอและติดตามคำขอของตน
- **Reviewer** ผู้ตรวจคำขอที่ได้รับมอบหมาย ใน Final ใช้บัญชี Reviewer คนละบัญชีสำหรับผู้ตรวจเบื้องต้นและผู้อนุมัติขั้นสุดท้าย
- ขอบเขตจบที่การอนุมัติคำขอ ผลอนุมัติหมายถึงอนุญาตให้เบิก การโอนเงิน การตัดงบ การอัปโหลดหลักฐาน การสมัครบัญชี และหน้าตั้งค่าลำดับอนุมัติอยู่นอกขอบเขต
- ใช้บัญชีและข้อมูลจำลอง หมวดค่าใช้จ่ายคงที่คืออุปกรณ์ กิจกรรม และเดินทาง รับยอดเต็มบาทตั้งแต่ 1 ถึง 100,000 บาท เพดานนี้เป็นกติกาที่โครงการกำหนด ใช้รหัสหมวด `EQUIPMENT`, `ACTIVITY`, `TRAVEL` ตามลำดับ

| ID | ข้อกำหนด | ฟีเจอร์ | Sprint | วิธีตรวจ |
|---|---|---|---:|---|
| FR-01 | ผู้ใช้ล็อกอิน ตรวจบัญชีปัจจุบัน และออกจากระบบได้ | F-01 | 1 | AC-01–03 |
| FR-02 | Requester ส่งคำขอและเปิดรายการ รายละเอียด และประวัติของตนได้ | F-02 | 1 | AC-04–06 |
| FR-03 | Reviewer เปิดคำขอที่ได้รับมอบหมายและอนุมัติหรือปฏิเสธได้ ผู้ขอเห็นผลที่บันทึกไว้ | F-03 | 1 | AC-06–08 |
| BR-01 | รายการหลัง trim มี 1–120 ตัวอักษร หมวดต้องอยู่ในรายการที่กำหนด ยอดเป็นจำนวนเต็ม 1–100,000 บาท | F-02 | 1 | AC-04–05 |
| BR-02 | สร้างคำขอในสถานะ SUBMITTED และมอบหมาย Reviewer ฝั่งเซิร์ฟเวอร์ | F-02 | 1 | AC-04 |
| BR-03 | ผู้ตัดสินต้องเป็น Reviewer ที่ได้รับมอบหมายและคนละบัญชีกับผู้ขอ | F-03 | 1 | AC-06, AC-09 |
| BR-04 | Sprint 1 ตัดสินได้จาก SUBMITTED ครั้งเดียว และบันทึกสถานะกับเหตุการณ์ใน transaction เดียว | F-03 | 1 | AC-07, AC-08, AC-10 |
| NFR-01 | ทุก API ที่คุ้มครองปฏิเสธ anonymous และบังคับใช้ role/ownership โดยไม่คืนข้อมูลของคำขอนอกสิทธิ์ | F-01, F-02, F-03 | 1 | AC-03, AC-06, AC-09 |
| NFR-02 | เปิดอ่านคำขอและประวัติจาก PostgreSQL ได้หลังสร้างแอปใหม่ด้วยฐานเดิม และตรวจซ้ำหลัง deploy ใน Lab 5 | F-02, F-03 | 1 | AC-08 |
| FR-04 | Reviewer ส่งคำขอกลับให้แก้และบันทึกเหตุผลที่ผู้ขอเปิดดูได้ | F-04 | 2 | วาง AC ก่อน implement |
| FR-05 | Requester แก้รายละเอียดของคำขอที่ถูกส่งกลับและส่งใหม่ โดยยังเห็นประวัติรอบก่อน | F-05 | 2 | วาง AC ก่อน implement |
| BR-05 | ส่งกลับได้จาก SUBMITTED และส่งใหม่ได้โดยเจ้าของจาก RETURNED เท่านั้น | F-04, F-05 | 2 | วาง AC ก่อน implement |
| BR-06 | ผู้ขอแก้หรือส่งใหม่ได้เฉพาะเมื่อเป็นเจ้าของคำขอในสถานะ RETURNED ซึ่งเริ่มรองรับใน Sprint 2 คำขอที่ส่งแล้วจึงอ่านได้อย่างเดียวสำหรับผู้ขอใน Sprint 1 | F-02, F-05 | 1, 2 | AC-04, AC-08 ใน Sprint 1 และวาง AC การแก้/ส่งใหม่ก่อน Sprint 2 |
| BR-07 | ผู้ตรวจต้องระบุเหตุผลปฏิเสธ 1–300 ตัวอักษรหลัง trim และผู้ขอต้องอ่านเหตุผลได้จากประวัติ | F-03 | 1 | AC-07 |
| FR-06 | Reviewer ดูจำนวนคำขอตามสถานะและยอดอนุมัติแยกหมวดจากคำขอที่ตนรับผิดชอบได้ | F-06 | 3 | วาง AC ก่อน implement |
| FR-07 | ระบบส่งคำขอผ่านผู้ตรวจเบื้องต้นและผู้อนุมัติขั้นสุดท้ายตามลำดับ ผู้ขอเห็นสถานะและผลแต่ละขั้นในประวัติ | F-07 | 3 | ตรวจลำดับ ผู้มีสิทธิ์ตัดสิน ประวัติ และคำขอเดิม |
| FR-08 | Requester และ Reviewer กรองรายการคำขอที่ตนมีสิทธิ์ตามสถานะ หรือเลือกดูทุกสถานะได้ | F-08 | 3 | ตรวจตัวกรอง ผลว่าง ค่าผิด และการกรองข้ามสิทธิ์ |
| BR-08 | ระบบกำหนดผู้ตรวจสองบัญชีที่ต่างกันและต่างจากผู้ขอ ให้เฉพาะผู้ตรวจขั้นปัจจุบันตัดสินได้ และสถานะ APPROVED เกิดเมื่อขั้นสุดท้ายอนุมัติ | F-07 | 3 | ตรวจการข้ามขั้น การตัดสินซ้ำ ผู้ตรวจที่ไม่ถูกมอบหมาย และการอนุมัติตนเอง |
| BR-09 | ผู้ตรวจในขั้นปัจจุบันปฏิเสธหรือส่งกลับได้โดยมีเหตุผล เจ้าของแก้และส่งใหม่ได้เฉพาะจาก RETURNED และเริ่มตรวจขั้นแรกอีกครั้งโดยคงประวัติเดิม | F-04, F-05, F-07 | 2, 3 | ตรวจทั้งสองขั้น การส่งใหม่และการเรียก API ด้วยข้อมูลสถานะเก่า |
| BR-10 | API จำกัดผลตามเจ้าของหรือผู้ตรวจที่ได้รับมอบหมายก่อนคืนรายการที่ตรงตัวกรอง การเลือกทุกสถานะยังใช้สิทธิ์เดิม | F-08 | 3 | ตรวจขอบเขตทั้งสองบทบาทและกรณีไม่มี session |


## Versioned elaboration

- Preserve baseline v0.3 and original Sprint 1 behavior as historical contracts. F-04/F-05 elaborate the already-allocated Sprint 2 scope, not a scope transfer. Per-round revision control prevents stale earlier-round decisions. BR-04 is now one decision per current SUBMITTED revision, with earlier history retained.
- BR-06 permits owner edits from RETURNED in Sprint 2; the historical PATCH404 endpoint absence becomes a state/ownership rejection test once PATCH exists. No permission is relaxed for SUBMITTED or terminal requests.
- Reason/title length retains existing UTF-16 counting; Low Unicode counting and stale cross-tab session UI observations remain explicitly deferred pending a reviewed fix.
- F-06 count-only checkpoint does not complete approved-category totals; F-07/F-08 remain mandatory Final features. Detailed contracts and planned STS are under docs/contracts.
- No Lab 7 change is assumed instructor-approved here. Approved maintenance changes require a distinct change request/history.
