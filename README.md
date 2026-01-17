This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---
1. Authentication (แนะนำ!)
Login/Logout สำหรับ Admin
ป้องกันหน้า /admin/*
2. LINE Notify
แจ้งเตือนเมื่อมีคำสั่งซื้อใหม่
แจ้งเตือนเมื่อลูกค้าแนบสลิป
3. จัดการสินค้า
เพิ่ม/แก้ไข/ลบสินค้า
อัพโหลดรูปภาพ
จัดการตัวเลือก (Size, Color)
4. จัดการรอบขาย
สร้าง/ปิด/เปิดรอบ
ตั้งวัน-เวลา deadline
5. รายงาน
รายงานยอดขายรายวัน/เดือน
Export Excel
6. แก้ไขหน้าตั้งค่า
แก้ไขข้อมูลร้านได้จริง
อัพโหลดโลโก้


Demo Credentials
Email: 
owner@japan-preorder.com
owner@mon-cooking.com
Password: demo123

🔧 ส่วนที่ยังไม่สมบูรณ์
จัดการสินค้า - เพิ่ม/แก้ไข/ลบสินค้าใน Admin (ตอนนี้ใช้ seed data อย่างเดียว)
จัดการรอบขาย - สร้าง/ปิดรอบใน Admin
แก้ไขตั้งค่าร้าน - บันทึกข้อมูลธนาคาร/ค่าส่งได้จริง (ตอนนี้แสดงเฉยๆ)
LINE Notify - แจ้งเตือนเมื่อมี order ใหม่/แนบสลิป

netstat -ano | findstr :3000
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
taskkill /PID 12345 /F

หรือ
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F

หรือ 
Get-NetTCPConnection -LocalPort 3000 | `
  Select-Object -Property OwningProcess | `
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

Remove-Item -Recurse -Force .next
node node_modules/next/dist/bin/next dev


cmd / "set DATABASE_URL="postgresql://postgres:ckRrxUxZHphSyygdSZpqCFnLkTytQSCB@yamabiko.proxy.rlwy.net:57015/railway && npx prisma db seed"



https://console.cloudinary.com/app/c-46c5e79a1104fd684bf2a5a2a338d6/image/getting-started
Cloud name ds7ysdgvn
api key    226152673865869
api secret cYj7uw2RUxjjTVeC2GwhVAllrYM


Telegram Bot Token: 8421839826:AAE3X3H1-8G-97jnyhnaLSnI31q4QR2JYNU
Telegram Chat ID: 7764440784

 Workflow ที่แนะนำ หลังปรับปรุง code
1. แก้ไข schema.prisma ใน local
2. รัน: npx prisma migrate dev --name add_feature_x
3. ทดสอบใน local
4. Commit ทั้ง schema.prisma และ folder migrations/
5. Push to GitHub → Railway auto-deploys
6. Railway รัน: npx prisma migrate deploy (อัตโนมัติ)


--------------------------------------------16/1/2026-------------

resend APT re_cX8q5VAr_DLe5axxUamaoBfH4L9rtYPSM


resend email
เวลา Deploy ขึ้น Production:
ต้องอัพเดท NEXT_PUBLIC_APP_URL ใน Railway:

NEXT_PUBLIC_APP_URL=https://preorder24.com
