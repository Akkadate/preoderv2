# แผนพัฒนาระบบ Package & Plan Limitation

วันที่สร้าง: 17 มกราคม 2567

---

## 1. ภาพรวมระบบ

### 1.1 ประเภท Package

| Package | ราคา | รอบขาย/เดือน | ออเดอร์/เดือน | Features |
|---------|------|--------------|---------------|----------|
| **FREE** | ฟรี | 10 | 50 | พื้นฐาน |
| **PRO** | ฿299/เดือน | ไม่จำกัด | ไม่จำกัด | + Telegram Alert |
| **ENTERPRISE** | ติดต่อ | ไม่จำกัด | ไม่จำกัด | + Custom Domain + Priority Support |

### 1.2 User Flow

```
สมัครใหม่ → Free Plan อัตโนมัติ
                ↓
        ใช้งานจนถึง limit
                ↓
        แสดง popup อัพเกรด
                ↓
        ชำระเงิน (PromptPay)
                ↓
        Admin verify → Activate Pro
```

---

## 2. Database Schema Changes

### 2.1 เพิ่ม Enum ใน Prisma

```prisma
enum PlanType {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PENDING
}
```

### 2.2 เพิ่ม Model: Subscription

```prisma
model Subscription {
  id          String             @id @default(cuid())
  shopId      String             @unique
  shop        Shop               @relation(fields: [shopId], references: [id])
  plan        PlanType           @default(FREE)
  status      SubscriptionStatus @default(ACTIVE)
  
  // Billing
  startDate   DateTime           @default(now())
  endDate     DateTime?          // null = ไม่หมดอายุ (Free plan)
  
  // Usage tracking (reset ทุกเดือน)
  roundsUsed  Int                @default(0)
  ordersUsed  Int                @default(0)
  usageResetAt DateTime          @default(now())
  
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}
```

### 2.3 เพิ่ม Model: PaymentHistory

```prisma
model PaymentHistory {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  
  amount          Float
  method          String   // "PROMPTPAY", "BANK_TRANSFER"
  slipImage       String?  // URL ของสลิป
  status          String   // "PENDING", "APPROVED", "REJECTED"
  
  approvedBy      String?  // Admin user id
  approvedAt      DateTime?
  note            String?
  
  createdAt       DateTime @default(now())
}
```

---

## 3. API Endpoints

### 3.1 Usage Tracking

```
GET  /api/subscription/usage
     → { roundsUsed, ordersUsed, limit, plan }

POST /api/subscription/check-limit
     → { canCreateRound: true/false, remainingRounds: 5 }
```

### 3.2 Upgrade Flow

```
GET  /api/subscription/plans
     → รายละเอียด plans ทั้งหมด

POST /api/subscription/upgrade
     body: { plan: "PRO", slipImage: "url" }
     → สร้าง pending payment

GET  /api/admin/payments/pending
     → รายการรอ approve (Admin)

POST /api/admin/payments/:id/approve
     → Activate subscription
```

---

## 4. Implementation Steps

### Phase 1: Database & Models
- [ ] เพิ่ม Prisma schema (Subscription, PaymentHistory)
- [ ] สร้าง Subscription อัตโนมัติเมื่อสร้าง Shop
- [ ] เพิ่ม relation Shop ↔ Subscription

### Phase 2: Usage Tracking
- [ ] สร้าง middleware/hook นับ usage
- [ ] เพิ่มการนับเมื่อสร้าง Round
- [ ] เพิ่มการนับเมื่อสร้าง Order
- [ ] Reset usage ทุกวันที่ 1 ของเดือน (cron job หรือ check on-demand)

### Phase 3: Limit Enforcement
- [ ] ตรวจสอบ limit ก่อนสร้าง Round
- [ ] ตรวจสอบ limit ก่อนรับ Order
- [ ] แสดง warning เมื่อใกล้ถึง limit (80%)
- [ ] แสดง upgrade modal เมื่อถึง limit

### Phase 4: Upgrade UI
- [ ] สร้างหน้า `/admin/upgrade`
- [ ] แสดงเปรียบเทียบ Plans
- [ ] Form อัพโหลดสลิป
- [ ] แสดงสถานะ pending

### Phase 5: Admin Management
- [ ] สร้างหน้า `/super-admin/payments`
- [ ] ดูรายการ pending payments
- [ ] Approve/Reject พร้อมหมายเหตุ
- [ ] ส่ง email แจ้งผลให้ user

### Phase 6: Cron Jobs
- [ ] Reset usage counter ทุกเดือน
- [ ] แจ้งเตือนก่อน subscription หมดอายุ
- [ ] ลดระดับ plan เมื่อหมดอายุ

---

## 5. Files to Create/Modify

### New Files
```
app/api/subscription/usage/route.ts
app/api/subscription/check-limit/route.ts
app/api/subscription/upgrade/route.ts
app/api/admin/payments/route.ts
app/api/admin/payments/[id]/approve/route.ts
app/admin/upgrade/page.tsx
app/admin/billing/page.tsx
lib/subscription.ts
lib/usage.ts
```

### Modify Files
```
prisma/schema.prisma          → เพิ่ม models
app/api/shop/create/route.ts  → สร้าง subscription ด้วย
app/api/rounds/route.ts       → ตรวจสอบ limit
app/[slug]/order/route.ts     → ตรวจสอบ limit
components/admin/sidebar.tsx  → เพิ่มเมนู Billing
```

---

## 6. UI Components

### 6.1 Usage Indicator (Dashboard)
```
┌────────────────────────────────────┐
│  Free Plan                         │
│  ━━━━━━━━━━━━━━━━ 80%              │
│  รอบขาย: 8/10 ใช้แล้ว              │
│  ออเดอร์: 40/50 ใช้แล้ว            │
│  [อัพเกรดเป็น Pro]                 │
└────────────────────────────────────┘
```

### 6.2 Limit Reached Modal
```
┌────────────────────────────────────┐
│  ⚠️ ถึงขีดจำกัดแล้ว                │
│                                    │
│  คุณใช้รอบขายครบ 10 รอบ/เดือนแล้ว   │
│                                    │
│  อัพเกรดเป็น Pro Plan              │
│  เพียง ฿299/เดือน                  │
│  รับรอบขายและออเดอร์ไม่จำกัด!       │
│                                    │
│  [อัพเกรดเลย]   [ไว้ทีหลัง]        │
└────────────────────────────────────┘
```

### 6.3 Upgrade Page
```
/admin/upgrade

┌────────────────────────────────────┐
│  เลือกแพ็คเกจที่เหมาะกับคุณ         │
│                                    │
│  ┌──────┐  ┌──────┐  ┌──────────┐  │
│  │ FREE │  │ PRO  │  │ENTERPRISE│  │
│  │ ฟรี  │  │ ฿299 │  │ ติดต่อ   │  │
│  │      │  │ ⭐    │  │          │  │
│  └──────┘  └──────┘  └──────────┘  │
│                                    │
│  ชำระผ่าน PromptPay               │
│  [QR Code]                        │
│  หรือโอนเข้าบัญชี xxx-xxx-xxx      │
│                                    │
│  อัพโหลดสลิป: [เลือกไฟล์]          │
│  [ส่งหลักฐาน]                      │
└────────────────────────────────────┘
```

---

## 7. Environment Variables

```env
# PromptPay
PROMPTPAY_NUMBER=0812345678
PROMPTPAY_NAME=บริษัท xxx จำกัด

# Bank Account (optional)
BANK_NAME=กสิกรไทย
BANK_ACCOUNT=xxx-x-xxxxx-x
BANK_ACCOUNT_NAME=บริษัท xxx จำกัด
```

---

## 8. Testing Checklist

- [ ] สมัครใหม่ได้ Free plan อัตโนมัติ
- [ ] แสดง usage ที่ถูกต้อง
- [ ] สร้าง Round เพิ่ม usage
- [ ] รับ Order เพิ่ม usage
- [ ] Block เมื่อถึง limit
- [ ] อัพโหลดสลิปได้
- [ ] Admin approve/reject ได้
- [ ] Activate plan หลัง approve
- [ ] Reset usage ทุกเดือน

---

## 9. Priority Order

1. **สูงสุด**: Database schema + Usage tracking
2. **สูง**: Limit enforcement
3. **ปานกลาง**: Upgrade UI + Payment
4. **ต่ำ**: Admin management + Cron jobs

---

## 10. Estimated Time

| Phase | ระยะเวลาโดยประมาณ |
|-------|-------------------|
| Phase 1: Database | 1-2 ชั่วโมง |
| Phase 2: Usage Tracking | 2-3 ชั่วโมง |
| Phase 3: Limit Enforcement | 2-3 ชั่วโมง |
| Phase 4: Upgrade UI | 3-4 ชั่วโมง |
| Phase 5: Admin Management | 2-3 ชั่วโมง |
| Phase 6: Cron Jobs | 1-2 ชั่วโมง |
| **รวม** | **11-17 ชั่วโมง** |

---

เอกสารนี้สามารถใช้เป็น reference ในการพัฒนาระบบ Plan Limitation ในอนาคตได้
