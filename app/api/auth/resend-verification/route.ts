import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'กรุณาระบุอีเมล' },
                { status: 400 }
            )
        }

        // ตรวจสอบว่ามี user นี้ไหม
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'ไม่พบบัญชีนี้' },
                { status: 404 }
            )
        }

        // ตรวจสอบว่ายืนยันแล้วหรือยัง
        if (user.emailVerified) {
            return NextResponse.json(
                { error: 'อีเมลนี้ยืนยันแล้ว' },
                { status: 400 }
            )
        }

        // สร้าง token ใหม่
        const verificationToken = await generateVerificationToken(email)

        // ส่งอีเมลยืนยัน
        const emailResult = await sendVerificationEmail(email, verificationToken.token)

        if (!emailResult.success) {
            return NextResponse.json(
                { error: 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'ส่งอีเมลยืนยันใหม่แล้ว',
        })
    } catch (error) {
        console.error('Resend verification error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
