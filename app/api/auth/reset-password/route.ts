import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPasswordResetToken, deletePasswordResetToken } from '@/lib/tokens'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'ข้อมูลไม่ครบถ้วน' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
                { status: 400 }
            )
        }

        // ตรวจสอบ token
        const result = await verifyPasswordResetToken(token)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        // Hash password ใหม่
        const hashedPassword = await bcrypt.hash(password, 12)

        // อัพเดท password
        await prisma.user.update({
            where: { email: result.email },
            data: { password: hashedPassword },
        })

        // ลบ token ที่ใช้แล้ว
        if (result.tokenId) {
            await deletePasswordResetToken(result.tokenId)
        }

        return NextResponse.json({
            success: true,
            message: 'เปลี่ยนรหัสผ่านสำเร็จ!',
        })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
