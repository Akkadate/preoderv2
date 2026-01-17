import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// สร้าง token สำหรับยืนยันอีเมล (หมดอายุใน 24 ชั่วโมง)
export async function generateVerificationToken(email: string) {
    const token = uuidv4()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // ลบ token เก่าของ email นี้ก่อน
    await prisma.verificationToken.deleteMany({
        where: { email },
    })

    // สร้าง token ใหม่
    const verificationToken = await prisma.verificationToken.create({
        data: {
            email,
            token,
            expires,
        },
    })

    return verificationToken
}

// ตรวจสอบ token
export async function verifyToken(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!verificationToken) {
        return { success: false, error: 'Token ไม่ถูกต้อง' }
    }

    // ตรวจสอบว่าหมดอายุหรือยัง
    if (verificationToken.expires < new Date()) {
        // ลบ token ที่หมดอายุ
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
        })
        return { success: false, error: 'Token หมดอายุแล้ว' }
    }

    // อัพเดท user ว่ายืนยันอีเมลแล้ว
    const user = await prisma.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: new Date() },
    })

    // ลบ token ที่ใช้แล้ว
    await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
    })

    return {
        success: true,
        email: verificationToken.email,
        userName: user.name,
    }
}

// สร้าง token สำหรับรีเซ็ตรหัสผ่าน (หมดอายุใน 1 ชั่วโมง)
export async function generatePasswordResetToken(email: string) {
    const token = uuidv4()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // ลบ token เก่าของ email นี้ก่อน
    await prisma.passwordResetToken.deleteMany({
        where: { email },
    })

    // สร้าง token ใหม่
    const resetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    })

    return resetToken
}

// ตรวจสอบ password reset token
export async function verifyPasswordResetToken(token: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    })

    if (!resetToken) {
        return { success: false, error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' }
    }

    // ตรวจสอบว่าหมดอายุหรือยัง
    if (resetToken.expires < new Date()) {
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        })
        return { success: false, error: 'ลิงก์หมดอายุแล้ว กรุณาขอใหม่' }
    }

    return { success: true, email: resetToken.email, tokenId: resetToken.id }
}

// ลบ token หลังใช้งาน
export async function deletePasswordResetToken(tokenId: string) {
    await prisma.passwordResetToken.delete({
        where: { id: tokenId },
    })
}
