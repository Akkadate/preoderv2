import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json()

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user (ยังไม่ verify email)
        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
                emailVerified: null, // ยังไม่ยืนยัน
            },
        })

        // สร้าง verification token
        const verificationToken = await generateVerificationToken(email)

        // ส่งอีเมลยืนยัน
        const emailResult = await sendVerificationEmail(email, verificationToken.token)

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error)
            // ยังให้สมัครสำเร็จ แต่แจ้งว่าส่งอีเมลไม่ได้
        }

        return NextResponse.json({
            success: true,
            message: 'สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
