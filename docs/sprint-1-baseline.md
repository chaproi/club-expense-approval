# Club Expense Approval — Engineering Baseline

CPE 334 · TH-038 · Solo · Theme 5 · 5 พฤศจิกายน 2026  
Deliverable 1 · 8 พฤศจิกายน 2026 เวลา 23:59 · Baseline v0.2 · พร้อมลง Git ก่อน implementation

## A. Software Requirements Specification

ชมรมนักศึกษาต้องการให้สมาชิกส่งคำขอเบิกและกลับมาดูผลได้จากที่เดียว เหรัญญิกต้องรู้ว่าต้องตรวจคำขอไหนและเคยตัดสินอย่างไร ระบบรองรับชมรมเดียว คำขอละหนึ่งรายการ และผู้ตรวจหนึ่งคนต่อคำขอ

- **Requester** สมาชิกที่ส่งคำขอและติดตามคำขอของตน
- **Reviewer** เหรัญญิกที่ตรวจคำขอที่ได้รับมอบหมาย
- ขอบเขตจบที่การอนุมัติคำขอ ผลอนุมัติหมายถึงอนุญาตให้เบิก การโอนเงิน การตัดงบ การอัปโหลดหลักฐาน การสมัครบัญชี และการอนุมัติหลายขั้นอยู่นอกขอบเขต
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

## B. Feature Inventory และ dependencies

ตารางใน Part A เชื่อม Requirement ID กับ Feature ID, Sprint และวิธีตรวจ ฟีเจอร์ทั้งหมดมีสถานะ Planned และผลเทสต์ยังรอ implementation ฟีเจอร์ Sprint 2–3 จะกำหนด AC/STS ก่อนเริ่มฟีเจอร์นั้น ยังไม่มีการเปลี่ยนขอบเขตที่ได้รับอนุมัติจากผู้สอน

| Feature ID | ฟีเจอร์ | Dependency |
|---|---|---|
| F-01 | บัญชีและ session | PostgreSQL, migration และ seed |
| F-02 | ส่งและดูคำขอ | F-01 |
| F-03 | ตรวจ ตัดสิน และบันทึกประวัติ | F-02 |
| F-04 | ส่งกลับให้แก้ | F-03 |
| F-05 | แก้และส่งใหม่ | F-04 |
| F-06 | สรุปคำขอและยอดอนุมัติ | F-05 |

## C. System-Level SDS

### สถาปัตยกรรมและข้อมูล

ใช้ React + Vite + TypeScript สำหรับ UI, Express + TypeScript สำหรับ REST API และ Prisma + PostgreSQL สำหรับ persistence เพราะเป็น stack เดียวกับ TokTickIT แยก auth, expense requests และ decisions ภายในแอปเดียว โดย Express บังคับใช้กฎธุรกิจและสิทธิ์ หน้าเว็บเรียก API แบบ same-origin ผ่าน Vite proxy ระหว่างพัฒนา และให้ Express เสิร์ฟเว็บที่ build แล้วสำหรับ deployment

| Entity | ข้อมูลและข้อจำกัด |
|---|---|
| User | ID, email แบบ unique, displayName, passwordHash, role เป็น REQUESTER หรือ REVIEWER |
| Session | tokenHash แบบ unique, userId, expiresAt ลบ session เมื่อ logout |
| ExpenseRequest | ID, requesterId และ assignedReviewerId อ้างถึง User, title, category, amountBaht แบบจำนวนเต็ม, status, createdAt, updatedAt |
| RequestEvent | ID, requestId, actorId, type, createdAt เหตุการณ์ Sprint 1 คือ SUBMITTED, APPROVED, REJECTED มี reason ซึ่งจำเป็นสำหรับ REJECTED และเป็น null สำหรับเหตุการณ์อื่น |

สถานะ Sprint 1 มีทางเดิน `SUBMITTED → APPROVED` หรือ `SUBMITTED → REJECTED` ทั้งสองปลายทางสิ้นสุดการตัดสิน สมาชิกอ่านผลได้และหน้ารายละเอียดไม่มีปุ่มแก้ไข สร้างคำขอพร้อมเหตุการณ์ SUBMITTED ใน transaction เดียว เมื่อมีการตัดสินให้แก้สถานะด้วย conditional update ที่ตรวจ ID, ผู้ตรวจที่ได้รับมอบหมาย และสถานะ SUBMITTED แล้วเพิ่มเหตุการณ์ใน transaction เดียว หากคำขอถูกตัดสินไปแล้ว ให้คืน 409 โดยไม่เพิ่มเหตุการณ์ ใช้ foreign key และ constraint ของฐานข้อมูลสำหรับยอดเงินตามที่ระบุ

### หน้าจอและสิทธิ์

- **Login** ใส่อีเมลและรหัสผ่าน มี error เดียวเมื่อ credentials ไม่ถูกต้อง
- **Requester** หน้า My Requests พร้อมฟอร์มส่งคำขอ และหน้าอ่านรายละเอียดกับ timeline
- **Reviewer** หน้า Assigned Requests และหน้าอ่านรายละเอียดที่มีปุ่ม Approve/Reject สำหรับคำขอ SUBMITTED ฟอร์ม Reject บังคับกรอกเหตุผล ผู้ขอเห็นเหตุผลใน timeline หลังโหลดรายละเอียดใหม่
- รายการมี loading, empty และ error state ฟอร์มแสดงข้อความ validation และปิดปุ่มชั่วคราวระหว่างส่ง หลัง 409 ให้โหลดสถานะล่าสุด

| การทำงาน | Requester | Reviewer |
|---|---|---|
| ส่งคำขอ | ได้ ฝั่ง API ใช้ ID จาก session | 403 |
| เปิดรายการ | เฉพาะของตน | เฉพาะที่ได้รับมอบหมาย |
| เปิดรายละเอียดและประวัติ | เฉพาะของตน | เฉพาะที่ได้รับมอบหมาย |
| ตัดสิน | 403 | เฉพาะที่ได้รับมอบหมาย ขณะ SUBMITTED และผู้ตรวจต้องไม่ใช่ผู้ขอ |

### Session, API และ deployment

ใช้รหัสผ่านที่ hash ด้วย Argon2id และ opaque session token แบบสุ่ม เก็บ hash ของ token ใน PostgreSQL และส่ง token ผ่าน cookie แบบ HttpOnly, SameSite=Lax และ Secure บน HTTPS กำหนดอายุ 8 ชั่วโมงจากการล็อกอิน API ป้องกันการส่งคำสั่งข้าม origin โดยตรวจ Origin ของ browser requests ที่เปลี่ยนข้อมูล Logout ลบ session และล้าง cookie

กำหนด `DATABASE_URL`, `APP_ORIGIN`, `PORT` และ `DEFAULT_REVIEWER_EMAIL` ใน environment โดยค่า reviewer ต้องตรงกับบัญชี REVIEWER ที่ seed ไว้ API กำหนดผู้ตรวจเองและคืน 503 หากการตั้งค่า reviewer ใช้งานไม่ได้ Seed ให้มี Requester สองบัญชีและ Reviewer สองบัญชีเพื่อเทสต์สิทธิ์ รหัสผ่าน demo จัดผ่านการ seed หรือช่องทางส่วนตัว

แผน Lab 5 คือ build เป็น Docker image และ deploy แอปไปที่ GCP โดยใช้ PostgreSQL ที่เก็บข้อมูลแยกจากอายุของ container รายละเอียดบริการและการอนุญาตเข้าถึงขึ้นกับทรัพยากรใน Lab 5 ใน Sprint 1 ให้ README อธิบายวิธีติดตั้ง dependency → ตั้งค่า PostgreSQL และตัวแปรจาก `.env.example` → ใช้ Prisma migration กับฐานข้อมูล → seed บัญชีทดสอบ → รันแอปและเทสต์ เก็บเฉพาะค่าตัวอย่างใน `.env.example` และเก็บ `.env` กับ credentials จริงนอก Git

## D. Three-Sprint Plan

| Sprint | เป้าหมายและ dependency | จุดตรวจและผลที่ต้องแสดง |
|---|---|---|
| 1 | F-01–F-03 ทำเส้นทางอนุมัติครบตามลำดับใน Part B | 8 พ.ย. ส่ง → อนุมัติหรือปฏิเสธ → ผู้ขอเปิดดูผลและประวัติ จาก release บน main |
| 2 | F-04–F-05 ต่อยอดจากการตัดสินใน Sprint 1 | 29 พ.ย. ทั้งสองฟีเจอร์เสร็จ ทดสอบและรวมใน candidate ที่ deploy แล้ว สาธิตส่งกลับพร้อมเหตุผล → แก้ → ส่งใหม่ → ตรวจใหม่ |
| 3 | F-06 ใช้คำขอและประวัติจากสองสปรินต์แรกมาสรุปผล | 29 พ.ย. มีสเปกและหน้าสรุปจำนวนคำขอตามสถานะจากฐานจริงที่ทำและทดสอบแล้ว 13 ธ.ค. ยอดอนุมัติแยกหมวดและงาน regression, UAT และ final release ครบ |

## E. Sprint 1 Feature Contracts

ทุก API ใช้ JSON ยกเว้น response 204 ที่ไม่มี body ข้อผิดพลาดส่ง `{ error: { code, message } }` โดยคืน 400 สำหรับข้อมูลผิด, 401 เมื่อไม่ล็อกอิน, 403 เมื่อ role ผิด, 404 เมื่อไม่พบหรือไม่มีสิทธิ์เปิด record และ 409 เมื่อสถานะไม่อนุญาต Request body รับเฉพาะ field ที่กำหนด

| Feature | API และพฤติกรรมที่ต้อง implement |
|---|---|
| F-01 | `POST /api/auth/login` รับ `{ email, password }` คืน 200 และข้อมูลผู้ใช้ `{ id, displayName, role }` พร้อม cookie. `GET /api/auth/me` คืนข้อมูลรูปแบบเดียวกัน. `POST /api/auth/logout` ยกเลิก session และคืน 204 |
| F-02 | `POST /api/expense-requests` รับ `{ title, category, amountBaht }` เฉพาะ Requester คืน 201 พร้อมรายละเอียด. `GET /api/expense-requests` คืน `{ items }` เรียงจากใหม่ไปเก่าโดย ID เป็นตัวตัดสินเมื่อเวลาตรงกัน. `GET /api/expense-requests/:id` คืนรายละเอียดและประวัติตามสิทธิ์ |
| F-03 | `POST /api/expense-requests/:id/decision` รับ `{ decision: "APPROVED" }` หรือ `{ decision: "REJECTED", reason }` คืน 200 พร้อมรายละเอียดที่อัปเดต เหตุผลที่ว่างหรือเกิน 300 ตัวอักษรหลัง trim คืน 400 โดยไม่เปลี่ยนสถานะหรือประวัติ ปุ่มบนหน้า Reviewer เรียก API นี้ และหน้า Requester แสดงผลหลังโหลดข้อมูลใหม่ |

รายการคืน `id, title, category, amountBaht, status, createdAt` รายละเอียดเพิ่ม `updatedAt` และ `history` ซึ่งแต่ละรายการมี `type, actorDisplayName, createdAt, reason` เรียงจากเก่าไปใหม่และใช้ ID ตัดสินเมื่อเวลาตรงกัน API ไม่คืน hash หรือ token ใน JSON

| Feature | Requirements ที่เกี่ยวข้อง | UI และข้อมูลที่เปลี่ยน | Acceptance Criteria |
|---|---|---|---|
| F-01 | FR-01, NFR-01 | หน้า Login/Logout สร้างหรือลบ Session และอ่าน User ที่ seed ไว้ | AC-01–03 |
| F-02 | FR-02, BR-01, BR-02, BR-06, NFR-01, NFR-02 | ฟอร์มและหน้า My Requests สร้าง ExpenseRequest กับเหตุการณ์ SUBMITTED แล้วอ่านรายการ/รายละเอียดตามสิทธิ์ | AC-04–06, AC-08 |
| F-03 | FR-03, BR-03, BR-04, BR-07, NFR-01, NFR-02 | หน้า Assigned Requests และฟอร์มตัดสิน เปลี่ยนสถานะและเขียน RequestEvent พร้อมเหตุผลเมื่อ Reject | AC-06–10 |

### Acceptance Criteria และ Software Test Specification

| AC / Test ID | ระดับ | เงื่อนไขและการกระทำ | ผลที่คาด |
|---|---|---|---|
| AC-01 / T-01 | API/DB | ใช้บัญชี seed ล็อกอินแล้วเรียก me ด้วย cookie | 200 และได้ ID/role ของบัญชีที่ล็อกอิน |
| AC-02 / T-02 | API/DB | ส่งรหัสผ่านผิด จากนั้นล็อกอินถูกและเรียก logout แล้วใช้ cookie เดิม | รหัสผิดได้ 401 การใช้ cookie เดิมหลัง logout ได้ 401 |
| AC-03 / T-03 | API | เรียก me, list, detail, create และ decision โดยไม่มี session | ทุก endpoint คืน 401 |
| AC-04 / T-04 | API/DB | Requester ส่งข้อมูลที่ถูกต้อง โหลดรายการ/รายละเอียด และลอง PATCH คำขอที่ส่งแล้ว | 201 และอ่านคำขอเดิมได้ ผู้ตรวจมาจากระบบ สถานะ SUBMITTED มีประวัติสร้างหนึ่งรายการ ส่วน PATCH คืน 404 เพราะ Sprint 1 ไม่มี endpoint นี้ และรายละเอียดเดิมคงอยู่ |
| AC-05 / T-05 | Unit + API | ทดสอบยอด 0, 1, 100000, 100001 และทศนิยม ตรวจชื่อว่าง ชื่อยาว 120/121 ตัวอักษรหลัง trim และหมวดผิด ส่งตัวอย่างยอดผิดผ่าน API | รับเฉพาะค่าถูกต้อง API คืน 400 และไม่สร้าง record เมื่อข้อมูลผิด |
| AC-06 / T-06 | API/DB | Requester คนอื่นและ Reviewer ที่ไม่ได้รับมอบหมายลองเปิดคำขอ Reviewer ลองสร้างคำขอ และ Reviewer ที่ไม่ได้รับมอบหมายลองตัดสิน | รายการไม่รวมคำขอที่ไม่มีสิทธิ์ รายละเอียดและการตัดสินนอกสิทธิ์ได้ 404 ส่วน Reviewer ที่สร้างคำขอได้ 403 |
| AC-07 / T-07 | API/DB | Reviewer ที่ได้รับมอบหมายอนุมัติและปฏิเสธคำขอคนละรายการ โดยลองปฏิเสธด้วยเหตุผลว่างและยาวเกินก่อนส่งเหตุผลถูกต้อง | เหตุผลผิดได้ 400 สถานะและประวัติไม่เปลี่ยน เมื่อข้อมูลถูกต้อง สถานะและเหตุการณ์ตรงกับผลตัดสิน และผู้ขออ่านเหตุผลที่บันทึกไว้ได้ |
| AC-08 / T-08 | API/DB | ตัดสินคำขอ ปิดแอปและการเชื่อมต่อฐานข้อมูล เริ่มแอปใหม่ด้วย PostgreSQL ฐานเดิม แล้วให้เจ้าของเปิดรายละเอียด | อ่านผลและประวัติเดิมจากฐานข้อมูลได้ |
| AC-08 / T-09 | E2E | ล็อกอินเป็นผู้ขอ ส่งคำขอ สลับเป็นผู้ตรวจเพื่ออนุมัติ แล้วกลับเป็นผู้ขอเพื่อเปิดรายละเอียด | เห็นสถานะ APPROVED และรายการอนุมัติใน timeline ผ่านหน้าเว็บ หน้ารายละเอียดของผู้ขอไม่มีปุ่มแก้ไข |
| AC-09 / T-10 | Unit + API | ทดสอบนโยบายกรณี actor ตรงกับผู้ขอ และ Requester เรียก decision | นโยบายปฏิเสธการอนุมัติตนเอง API ของ Requester คืน 403 และไม่เปลี่ยนข้อมูล |
| AC-10 / T-11 | API/DB | ใช้คำขอสองรายการ รายการแรกลองตัดสินซ้ำหลังสำเร็จ รายการที่สองส่งการตัดสินสองครั้งพร้อมกัน | แต่ละรายการสำเร็จหนึ่งครั้ง อีกครั้งได้ 409 และประวัติการตัดสินมีเพียงหนึ่งรายการ |

ใช้ T-11 เป็นหลักฐาน RED → GREEN สำหรับกฎการตัดสินซ้ำ และ T-06 หรือ T-10 เป็นตัวอย่างเทสต์สิทธิ์ในรายงาน บันทึกผลจริงและ commit หลังรัน

### Definition of Done

- ผ่าน AC ตามสเปกพร้อมผล unit, API/DB และ E2E ที่ระบุ command, test file/name, pass/fail/skip และ commit
- Issue อ้างอิง Feature ID และ contract แล้วทำ feature branch จาก `staging/sprint-1` เปิด PR กลับเข้า staging ให้ผู้รีวิวตรวจ diff, เทสต์ และพฤติกรรม
- หลัง integration check ให้เปิด release PR จาก staging เข้า `main` ระบุ commit หรือ tag และทำซ้ำได้จาก README
- รายงานเก็บเดโมปกติ การเปิดผลจากฐานข้อมูล เคสปฏิเสธ และ backend authorization พร้อม PR สองชุดที่รีวิวแล้ว สถานะ board ผลทดสอบจริง และข้อจำกัดที่ยังเหลือ

## เริ่มเปิด Issue ตามลำดับ

| ลำดับ | ชื่อ Issue | ขอบเขต |
|---|---|---|
| 1 | F-01 — ตั้งโครงแอป ฐานข้อมูล และ login/session | UI/API, migration/seed, login/me/logout และ T-01–03 |
| 2 | F-02 — ส่งคำขอและดูคำขอที่มีสิทธิ์ | UI/API/DB ของคำขอ, validation และกรณีอ่านข้ามบัญชี |
| 3 | F-03 — ตัดสินคำขอและบันทึกประวัติ | Approve/Reject, transaction, เคสสิทธิ์และตัดสินซ้ำ, E2E ของ workflow หลัก |
