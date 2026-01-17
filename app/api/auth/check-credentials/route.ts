import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { status: 'error', error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
                { status: 400 }
            )
        }

        // หา user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.password) {
            return NextResponse.json({
                status: 'invalid_credentials',
                error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
            })
        }

        // ตรวจสอบ password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({
                status: 'invalid_credentials',
                error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
            })
        }

        // ตรวจสอบว่ายืนยันอีเมลแล้วหรือยัง
        if (!user.emailVerified) {
            return NextResponse.json({
                status: 'email_not_verified',
                error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
                email: user.email,
            })
        }

        // ทุกอย่างถูกต้อง
        return NextResponse.json({
            status: 'ok',
        })
    } catch (error) {
        console.error('Check credentials error:', error)
        return NextResponse.json(
            { status: 'error', error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
