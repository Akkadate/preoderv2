import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${APP_URL}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'PreOrder24 <noreply@preorder24.com>', // ใช้ domain ที่ verify แล้ว
      to: email,
      subject: '🔐 ยืนยันอีเมลของคุณ - PreOrder24',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Prompt', -apple-system, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 32px; text-align: center;">
              <div style="width: 60px; height: 60px; background: white; border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; font-weight: bold; color: #7c3aed;">24</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 24px;">ยืนยันอีเมลของคุณ</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ขอบคุณที่สมัครใช้งาน <strong>PreOrder24</strong>! กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ยืนยันอีเมล
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                หรือคัดลอกลิงก์นี้ไปเปิดใน browser:<br>
                <a href="${verificationLink}" style="color: #7c3aed; word-break: break-all;">${verificationLink}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง<br>
                หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// ส่งอีเมลยินดีต้อนรับหลังยืนยันอีเมล
export async function sendWelcomeEmail(email: string, userName?: string) {
  const dashboardLink = `${APP_URL}/admin`
  const displayName = userName || 'ลูกค้าใหม่'

  try {
    const { data, error } = await resend.emails.send({
      from: 'PreOrder24 <noreply@preorder24.com>',
      to: email,
      subject: 'ยินดีต้อนรับสู่ PreOrder24 - บัญชีของคุณพร้อมใช้งานแล้ว',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Prompt', -apple-system, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 40px 32px; text-align: center;">
              <div style="width: 80px; height: 80px; background: white; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; font-weight: bold; color: #7c3aed;">24</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px;">ยินดีต้อนรับสู่ PreOrder24</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">
                คุณ ${displayName}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ขอบคุณที่เลือกใช้ <strong>PreOrder24</strong>! บัญชีของคุณพร้อมใช้งานแล้ว เริ่มต้นรับออเดอร์ได้ทันที!
              </p>
              
              <!-- Quick Start Guide -->
              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px;">คู่มือเริ่มต้นใช้งาน</h2>
                
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                    <span style="background: #7c3aed; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                    <div>
                      <strong style="color: #374151;">สร้างร้านค้า</strong>
                      <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">ตั้งชื่อร้าน เลือกประเภท และปรับแต่งหน้าร้านของคุณ</p>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                    <span style="background: #7c3aed; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                    <div>
                      <strong style="color: #374151;">เพิ่มสินค้า</strong>
                      <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">อัพโหลดรูปภาพ ตั้งราคา และรายละเอียดสินค้าของคุณ</p>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                    <span style="background: #7c3aed; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                    <div>
                      <strong style="color: #374151;">เปิดรอบขาย</strong>
                      <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">สร้างรอบขาย กำหนดระยะเวลา แล้วแชร์ลิงก์ให้ลูกค้า</p>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: flex-start;">
                    <span style="background: #7c3aed; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">4</span>
                    <div>
                      <strong style="color: #374151;">รับออเดอร์ 24 ชั่วโมง!</strong>
                      <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">ระบบรับออเดอร์อัตโนมัติ ไม่พลาดทุกคำสั่งซื้อ</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${dashboardLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  เข้าสู่ Dashboard
                </a>
              </div>
              
              <!-- Package Info -->
              <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px;">แพ็คเกจปัจจุบันของคุณ: Free Plan</h3>
                <ul style="color: #78350f; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>10 รอบขายต่อเดือน</li>
                  <li>50 ออเดอร์ต่อเดือน</li>
                  <li>สินค้าไม่จำกัด</li>
                </ul>
                <p style="color: #92400e; font-size: 14px; margin: 12px 0 0;">
                  <strong>ต้องการเพิ่มลิมิต?</strong> อัพเกรดเป็น Pro Plan เพียง ฿299/เดือน 
                  ได้รับรอบขายและออเดอร์ไม่จำกัด + แจ้งเตือน Telegram!
                </p>
              </div>
              
              <!-- Support -->
              <div style="background: #f0f9ff; border-radius: 12px; padding: 20px;">
                <h3 style="color: #0369a1; font-size: 16px; margin: 0 0 8px;">ติดต่อฝ่ายสนับสนุน</h3>
                <p style="color: #0284c7; font-size: 14px; margin: 0;">
                  ติดต่อเราได้ที่ support@preorder24.com หรือ LINE: @preorder24
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                อีเมลนี้ส่งจาก PreOrder24 - ระบบจัดการออเดอร์สำหรับร้านค้าออนไลน์<br>
                © 2024 PreOrder24. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Welcome email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Welcome email send error:', error)
    return { success: false, error }
  }
}

// ส่งอีเมลรีเซ็ตรหัสผ่าน
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'PreOrder24 <noreply@preorder24.com>',
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - PreOrder24',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Prompt', -apple-system, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 32px; text-align: center;">
              <div style="width: 60px; height: 60px; background: white; border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; font-weight: bold; color: #7c3aed;">24</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 24px;">รีเซ็ตรหัสผ่าน</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี <strong>PreOrder24</strong> ของคุณ 
                กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ตั้งรหัสผ่านใหม่
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                หรือคัดลอกลิงก์นี้ไปเปิดใน browser:<br>
                <a href="${resetLink}" style="color: #7c3aed; word-break: break-all;">${resetLink}</a>
              </p>
              
              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                อีเมลนี้ส่งจาก PreOrder24<br>
                © 2024 PreOrder24. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Password reset email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Password reset email send error:', error)
    return { success: false, error }
  }
}
