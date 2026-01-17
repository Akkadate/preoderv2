# 🚀 Deployment Checklist - Railway

## ก่อน Push Code

### 1. ตรวจสอบ Local ทำงานปกติ
- [ ] `npm run dev` ไม่มี error
- [ ] Login/Register ทำงานได้
- [ ] Email verification ส่งได้

### 2. Commit Code
```bash
git add .
git commit -m "your message"
git push origin main
```

---

## Environment Variables บน Railway

ไปที่ Railway Dashboard → Project → Variables

### Required Variables:
| Variable | ค่า | หมายเหตุ |
|----------|-----|----------|
| `DATABASE_URL` | `postgresql://...` | Railway สร้างให้อัตโนมัติ |
| `AUTH_SECRET` | `your-secret-key` | สร้างด้วย `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | `ds7ysdgvn` | |
| `CLOUDINARY_API_KEY` | `226152673865869` | |
| `CLOUDINARY_API_SECRET` | `cYj7uw2RUxjjTVeC2GwhVAllrYM` | |
| `RESEND_API_KEY` | `re_cX8q5VAr_...` | สำหรับส่ง email |
| `NEXT_PUBLIC_APP_URL` | `https://preorder24.com` | ⚠️ **ต้องเป็น production URL** |

---

## หลัง Deploy

### 1. Verify Demo Users (ถ้ายังไม่ได้ทำ)

ไปที่ Railway Dashboard → Database → Query Tab แล้วรัน:

```sql
UPDATE "User" SET "emailVerified" = NOW() 
WHERE email IN ('owner@japan-preorder.com', 'owner@mom-cooking.com');
```

### 2. ตรวจสอบระบบ
- [ ] เข้าหน้าเว็บ production ได้
- [ ] Login ด้วย demo users ได้
- [ ] สร้างสินค้า/รอบขายได้

---

## Troubleshooting

### ❌ Error: Cannot find module '@prisma/client'
```bash
# ใน Railway Build Command เพิ่ม:
npx prisma generate && npm run build
```

### ❌ Error: NEXT_PUBLIC_APP_URL undefined
- ตรวจสอบว่าตั้ง `NEXT_PUBLIC_APP_URL` ใน Railway Variables
- ต้อง Redeploy หลังเพิ่ม variable

### ❌ Email ไม่ส่ง
- ตรวจสอบ `RESEND_API_KEY` ถูกต้อง
- ตรวจสอบ domain `preorder24.com` verified ใน Resend Dashboard

### ❌ Login แล้วหน้าว่าง
- Clear browser cache
- ตรวจสอบ `AUTH_SECRET` ตรงกับ production

---

## Railway Build Settings

### Build Command:
```
npx prisma generate && npm run build
```

### Start Command:
```
npm run start
```

---

## Database Migration

หลังเพิ่ม Prisma Schema ใหม่ ให้รัน:

```bash
# Local
npx prisma db push

# Railway จะรันให้อัตโนมัติผ่าน build command
```

---

## Quick Commands

```bash
# Push และ Deploy
git add . && git commit -m "update" && git push origin main

# ดู logs บน Railway
railway logs

# เชื่อมต่อ Railway DB จาก local
railway connect postgres
```

---

อัพเดทล่าสุด: มกราคม 2567
