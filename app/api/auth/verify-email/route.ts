import { NextRequest, NextResponse } from 'next/server'
import { verifyToken as verifyEmailToken } from '@/lib/tokens'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'ไม่พบ token' },
                { status: 400 }
            )
        }

        const result = await verifyEmailToken(token)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        // ส่งอีเมลยินดีต้อนรับ
        if (result.email) {
            await sendWelcomeEmail(result.email, result.userName || undefined)
        }

        return NextResponse.json({
            success: true,
            message: 'ยืนยันอีเมลสำเร็จ!',
            email: result.email,
        })
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
