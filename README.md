# ConcertPass – Modern Concert Ticketing System

ระบบจองบัตรคอนเสิร์ตออนไลน์ (React + TypeScript + Vite)

## Mini Project OOP

โปรเจกต์นี้ถูกปรับให้ตอบโจทย์ **Object-Oriented Programming Mini Project** ครบทั้ง 4 หลักการ:

- **Abstraction**
- **Encapsulation**
- **Inheritance**
- **Polymorphism**

ดูรายละเอียดและจุดอธิบายในไฟล์ → **[OOP_EXPLANATION.md](./OOP_EXPLANATION.md)**

### Domain Models (src/models/)

| Class | หลักการหลัก |
|-------|-------------|
| `User` (abstract) | Abstraction + Encapsulation |
| `Customer` / `Organizer` / `GateStaff` | Inheritance + Polymorphism |
| `PaymentMethod` (abstract) | Abstraction |
| `PromptPayPayment` / `CreditCardPayment` | Inheritance + Polymorphism |
| `Ticket` / `Order` / `ConcertEvent` | Encapsulation |

## วิธีรัน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รัน dev server
npm run dev
```

เปิดเบราว์เซอร์ตาม URL ที่ Vite แสดง (ปกติ http://localhost:5173)

### บัญชี Demo (ใส่อีเมลอย่างเดียว แล้วกด Login)

| บทบาท | อีเมล |
|--------|--------|
| ลูกค้า | praew.music@example.com |
| ผู้จัดงาน | somchai.organizer@example.com |
| เจ้าหน้าที่ Gate | karn.gate@example.com |

## Feature หลัก

- ค้นหา / เลือกคอนเสิร์ต
- แผนที่ที่นั่งแบบ interactive + hold ที่นั่งชั่วคราว
- ชำระเงิน PromptPay / บัตรเครดิต (จำลอง)
- E-Ticket + QR
- หน้า My Tickets
- Organizer Dashboard (สร้าง/แก้ไขคอนเสิร์ต, ปิด-เปิดการขาย)
- Gate Scanner (สแกนบัตรเช็คอิน)
- Audit Log

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (utility classes)
- Context API สำหรับ state management
- Domain Models (class-based OOP layer)

## โครงสร้างโฟลเดอร์สำคัญ

```
src/
├── models/          ← ★ OOP Classes (หลักการทั้ง 4)
├── components/      ← UI components
├── context/         ← ConcertPassContext (ใช้ models)
├── types/           ← TypeScript interfaces
├── data/            ← ข้อมูลคอนเสิร์ตเริ่มต้น
└── utils/           ← helper functions
```
