/**
 * Telegram Bot Helper
 * ใช้สำหรับส่งแจ้งเตือนไปยัง Telegram
 */

interface TelegramMessage {
    botToken: string
    chatId: string
    message: string
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

interface TelegramResponse {
    ok: boolean
    description?: string
    result?: any
}

/**
 * ส่ง message ไปยัง Telegram
 */
export async function sendTelegramMessage({
    botToken,
    chatId,
    message,
    parseMode = 'HTML'
}: TelegramMessage): Promise<TelegramResponse> {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: parseMode,
            }),
        })

        const data = await response.json()
        return data as TelegramResponse
    } catch (error) {
        console.error('Telegram send error:', error)
        return {
            ok: false,
            description: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * ส่งแจ้งเตือนออเดอร์ใหม่
 */
export async function notifyNewOrder(
    botToken: string,
    chatId: string,
    shopName: string,
    order: {
        code: string
        customerName: string
        customerPhone: string
        totalAmount: number
        shippingCost: number
        grandTotal: number
        items: { name: string; quantity: number; price: number }[]
    }
): Promise<TelegramResponse> {
    const itemList = order.items
        .map(item => `  • ${item.name} x${item.quantity} = ฿${(item.price * item.quantity).toLocaleString()}`)
        .join('\n')

    const message = `
🏢 <b>ร้าน: ${shopName}</b>
🛒 <b>ออเดอร์ใหม่!</b>

📋 <b>รหัส:</b> ${order.code}
👤 <b>ลูกค้า:</b> ${order.customerName}
📞 <b>โทร:</b> ${order.customerPhone}

<b>รายการสินค้า:</b>
${itemList}

💰 <b>ค่าสินค้า:</b> ฿${order.totalAmount.toLocaleString()}
🚚 <b>ค่าส่ง:</b> ฿${order.shippingCost.toLocaleString()}
━━━━━━━━━━━━━━
💵 <b>รวมทั้งหมด:</b> ฿${order.grandTotal.toLocaleString()}
`.trim()

    return sendTelegramMessage({ botToken, chatId, message })
}

/**
 * ส่งข้อความทดสอบ
 */
export async function sendTestMessage(
    botToken: string,
    chatId: string
): Promise<TelegramResponse> {
    return sendTelegramMessage({
        botToken,
        chatId,
        message: '✅ <b>ทดสอบสำเร็จ!</b>\n\nระบบแจ้งเตือน Telegram ใช้งานได้ปกติ'
    })
}
