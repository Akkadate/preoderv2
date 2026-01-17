import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'กรุณากรอกอีเมล' },
                { status: 400 }
            )
        }

        // ตรวจสอบว่ามี user นี้ไหม
        const user = await prisma.user.findUnique({
            where: { email },
        })

        // ไม่บอกว่าไม่มี user เพื่อความปลอดภัย
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้',
            })
        }

        // สร้าง token
        const resetToken = await generatePasswordResetToken(email)

        // ส่งอีเมล
        const emailResult = await sendPasswordResetEmail(email, resetToken.token)

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error)
        }

        return NextResponse.json({
            success: true,
            message: 'หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้',
        })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
