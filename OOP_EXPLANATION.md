# ConcertPass – คำอธิบายหลักการ OOP (สำหรับนำเสนอ)

โปรเจกต์นี้เพิ่ม **Domain Models** ที่เป็น class จริงในโฟลเดอร์ `src/models/`  
เพื่อตอบโจทย์ Mini Project OOP ครบทั้ง 4 หลักการ

---

## 1. Abstraction (นามธรรม)

| Class | ทำไมถือว่าเป็น Abstraction |
|-------|---------------------------|
| `User` (abstract) | กำหนด contract ว่า "ผู้ใช้ทุกคนต้องมี getPermissions()" โดยไม่ต้องรู้รายละเอียดของแต่ละ role |
| `PaymentMethod` (abstract) | กำหนดว่า "การชำระเงินต้องมี processPayment() และ getReceipt()" โดยไม่สนว่าเป็น PromptPay หรือบัตรเครดิต |

ไฟล์:
- `src/models/User.ts`
- `src/models/PaymentMethod.ts`

---

## 2. Encapsulation (การห่อหุ้ม)

ทุก class ใช้ **private fields** (`#field`) และเปิดให้เข้าถึงผ่าน getter / method เท่านั้น

ตัวอย่างชัดเจน:

```ts
// Ticket.ts
#status: TicketStatus;

checkIn(gateStaffName: string): { success: boolean; message: string } {
  if (this.#status === 'used') { ... }   // ควบคุมการเปลี่ยนสถานะภายใน class
  this.#status = 'used';
  ...
}
```

ไฟล์ที่ใช้ Encapsulation:
- `User.ts`, `Customer.ts`, `Organizer.ts`, `GateStaff.ts`
- `Ticket.ts`, `Order.ts`, `ConcertEvent.ts`
- `PaymentMethod.ts` และลูกหลาน

---

## 3. Inheritance (การสืบทอด)

```
User (abstract)
 ├── Customer
 ├── Organizer
 └── GateStaff

PaymentMethod (abstract)
 ├── PromptPayPayment
 └── CreditCardPayment
```

- `Customer extends User`
- `Organizer extends User`
- `GateStaff extends User`
- `PromptPayPayment extends PaymentMethod`
- `CreditCardPayment extends PaymentMethod`

มี inheritance อย่างน้อย 1 ชุด (จริงๆ มี 2 ชุด)

---

## 4. Polymorphism (พหุสัณฐาน)

### Override ตัวอย่างที่ 1 – User.getPermissions()
```ts
// Customer
getPermissions() {
  return ['view_concerts', 'select_seats', 'purchase_tickets', ...];
}

// Organizer
getPermissions() {
  return ['create_concert', 'edit_concert', 'view_sales_report', ...];
}

// GateStaff
getPermissions() {
  return ['scan_tickets', 'check_in_ticket', ...];
}
```

### Override ตัวอย่างที่ 2 – PaymentMethod.processPayment() & getReceipt()
```ts
// ใน ConcertPassContext.tsx → processPayment()
const payment = targetOrder.paymentMethod === 'credit_card'
  ? new CreditCardPayment(...)
  : new PromptPayPayment(...);

await payment.processPayment();   // เรียก method เดียวกัน แต่พฤติกรรมต่างกัน
console.log(payment.getReceipt());
```

### Override ตัวอย่างที่ 3 – getRoleDisplayName()
แต่ละ subclass แสดงชื่อบทบาทต่างกัน

---

## จำนวน Class ที่ออกแบบเอง (≥ 5)

1. `User` (abstract)
2. `Customer`
3. `Organizer`
4. `GateStaff`
5. `PaymentMethod` (abstract)
6. `PromptPayPayment`
7. `CreditCardPayment`
8. `Ticket`
9. `Order`
10. `ConcertEvent`

---

## จุดที่ถูกเรียกใช้จริงในระบบ (เพื่อ Demo)

| ตำแหน่ง | หลักการที่โชว์ |
|---------|----------------|
| `ConcertPassContext.tsx` → `login()` | Inheritance + Polymorphism (สร้าง User subclass แล้วเรียก getPermissions()) |
| `ConcertPassContext.tsx` → `processPayment()` | Polymorphism (PaymentMethod) + Encapsulation (Ticket class) |
| `ConcertPassContext.tsx` → `validateAndCheckInTicket()` | Encapsulation (Ticket.checkIn()) |

เปิด Browser Console แล้ว login / ชำระเงิน / สแกนบัตร จะเห็น log `[OOP User]`, `[OOP Permissions]`, `[OOP Payment Receipt]`

---

## โครงสร้างไฟล์ที่เพิ่ม

```
src/models/
├── index.ts              ← export ทั้งหมด + createUserFromPlain factory
├── User.ts               ← Abstract base + Encapsulation
├── Customer.ts           ← extends User + Override
├── Organizer.ts          ← extends User + Override
├── GateStaff.ts          ← extends User + Override
├── PaymentMethod.ts      ← Abstract + PromptPayPayment + CreditCardPayment
├── Ticket.ts             ← Encapsulation ของสถานะบัตร
├── Order.ts              ← Encapsulation ของคำสั่งซื้อ
└── ConcertEvent.ts       ← Domain class ของคอนเสิร์ต
```

---

## วิธีรันโปรเจกต์

```bash
cd concertpass
npm install
npm run dev
```

เปิด http://localhost:5173 (หรือพอร์ตที่ Vite แสดง)

**Demo บัญชี:**
- ลูกค้า: `praew.music@example.com`
- ผู้จัด: `somchai.organizer@example.com`
- Gate: `karn.gate@example.com`

(ไม่มี password จริง – แค่ใส่อีเมลแล้วกด Login)

---

## สรุปสำหรับสไลด์นำเสนอ

| หลักการ | Class / ตำแหน่ง | บรรทัดสำคัญ |
|---------|------------------|-------------|
| Abstraction | `User`, `PaymentMethod` | abstract class + abstract method |
| Encapsulation | ทุก class ใช้ `#private` | getter / `checkIn()` / `confirmPayment()` |
| Inheritance | Customer/Organizer/GateStaff extends User | `extends User` |
| Polymorphism | `getPermissions()`, `processPayment()`, `getReceipt()` | override ใน subclass |

พร้อม present ได้เลยครับ
