# System-Level SDS — Deliverable 2 working design

24 Nov 2026 · v0.4-candidate; historical/current/target differences explicit


### สถาปัตยกรรมและข้อมูล Sprint 1 (ประวัติเดิม; ส่วนเพิ่ม candidate อยู่ท้ายเอกสาร)

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

### การออกแบบสำหรับ Final

- **F-07** ใช้ `DEFAULT_REVIEWER_EMAIL` เป็นผู้ตรวจขั้นแรกและเพิ่ม `FINAL_REVIEWER_EMAIL` สำหรับขั้นสุดท้าย เซิร์ฟเวอร์ตรวจว่าทั้งสองเป็นบัญชี REVIEWER ที่ต่างกันและต่างจากผู้ขอ แล้วบันทึกการมอบหมายไว้กับคำขอ การตั้งค่าไม่ถูกต้องต้องหยุดการสร้างคำขอ
- ขั้นแรกอนุมัติเปลี่ยน `SUBMITTED → PENDING_FINAL_REVIEW` ขั้นสุดท้ายอนุมัติเปลี่ยน `PENDING_FINAL_REVIEW → APPROVED` ทั้งสองขั้นปฏิเสธหรือส่งกลับพร้อมเหตุผลได้ ผู้ขอส่งใหม่จาก `RETURNED` แล้วเริ่มที่ `SUBMITTED` ผู้ขออ่านเฉพาะคำขอของตน ผู้ตรวจทั้งสองอ่านเฉพาะคำขอที่ได้รับมอบหมายและตัดสินได้เฉพาะขั้นปัจจุบัน
- บันทึกผู้ตัดสิน ขั้น ผล เวลา และเหตุผลตามประเภทเหตุการณ์ใน transaction เดียวกับการเปลี่ยนสถานะ ตรวจขั้นและ revision ของคำขอเพื่อปฏิเสธการตัดสินซ้ำหรือคำสั่งจากรอบก่อนหลังมีการส่งใหม่ ทดสอบว่าขั้นแรกอนุมัติแล้วรายงานยังไม่นับยอด และคำขอที่อนุมัติครบถูกนับครั้งเดียวต่อรายงาน
- ตอนอัปเกรด ให้คงคำขอที่ตัดสินเสร็จแล้วและประวัติ Sprint 1–2 ไว้ตามเดิม กำหนดผู้อนุมัติขั้นสุดท้ายให้คำขอที่ยังเปิดอยู่ก่อนเปิดใช้ release ใหม่ ตรวจการมอบหมายก่อนเปลี่ยนข้อมูลและทดสอบว่าเปิดอ่านประวัติเดิม รวมถึงส่งคำขอเดิมที่ถูกส่งกลับเข้ากระบวนการสองขั้นได้
- **F-08** เพิ่มตัวเลือกสถานะและ “ทุกสถานะ” ใน My Requests และ Assigned Requests ใช้ `GET /api/expense-requests?status=...` พารามิเตอร์เป็น optional การไม่ส่งหมายถึงทุกสถานะ ค่าสถานะที่ไม่รองรับคืน 400 และ API ใช้เงื่อนไขสถานะร่วมกับสิทธิ์เดิมก่อนคืนผล


## Sprint 2/current candidate additions (acceptance pending)

- Add RETURNED, EDITED/RESUBMITTED events and nonnegative revision. Existing rows default to revision0; preserve all IDs/timestamps/history. State/event writes use one PostgreSQL transaction and a conditional status+revision+principal predicate.
- SUBMITTED→APPROVED/REJECTED/RETURNED; owner save keeps RETURNED; owner resubmit→SUBMITTED. Each successful write increments revision; old round/step commands409. Rejected writes do not append history.
- Requester detail adds owner-only edit/save/resubmit controls only in RETURNED. Reviewer detail adds a separate Return reason form and shows actual saved history. UI always sends the loaded revision.
- F-06 count summary groups current requests scoped by assignedReviewerId in one DB query; server enforces REVIEWER. No data migration for summary. UI displays DB-sourced values and refreshes after changes.
- F-07/F-08 sections above remain target designs, not claims that current code implements two-stage approval or filters. Add current implementation/status rows to feature inventory as tests/reviews run.
