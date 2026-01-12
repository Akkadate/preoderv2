import { NextRequest, NextResponse } from 'next/server'
import { sendTestMessage } from '@/lib/telegram'
import { auth } from '@/auth'

// POST test Telegram message
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { botToken, chatId } = body

        if (!botToken || !chatId) {
            return NextResponse.json(
                { error: 'กรุณากรอก Bot Token และ Chat ID' },
                { status: 400 }
            )
        }

        const result = await sendTestMessage(botToken, chatId)

        if (result.ok) {
            return NextResponse.json({ success: true, message: 'ส่งข้อความทดสอบสำเร็จ!' })
        } else {
            return NextResponse.json(
                { error: result.description || 'ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบ Token และ Chat ID' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Test telegram error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด' },
            { status: 500 }
        )
    }
}
