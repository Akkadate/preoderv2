import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyNewOrder } from '@/lib/telegram'

interface CartItem {
    productId: string
    productName: string
    price: number
    quantity: number
    selectedOptions?: Record<string, string>
}

interface CheckoutRequest {
    items: CartItem[]
    customerInfo: {
        name: string
        phone: string
        address: string
        lineId?: string
        note?: string
    }
    shopId: string
    roundId: string
    shippingCost: number
}

function generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD-${timestamp}${random}`
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json()
        const { items, customerInfo, shopId, roundId, shippingCost } = body

        // Validate round is still open
        const round = await prisma.round.findUnique({
            where: { id: roundId },
        })

        if (!round || round.status !== 'OPEN' || new Date() > round.closesAt) {
            return NextResponse.json(
                { error: 'Round is closed' },
                { status: 400 }
            )
        }

        // Calculate totals
        const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        )
        const grandTotal = totalAmount + shippingCost

        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: {
                shopId,
                contactInfo: customerInfo.phone,
            },
        })

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: customerInfo.name,
                    contactInfo: customerInfo.phone,
                    address: customerInfo.address,
                    shopId,
                },
            })
        }

        // Create order with items
        const order = await prisma.order.create({
            data: {
                code: generateOrderCode(),
                totalAmount,
                shippingCost,
                grandTotal,
                shippingAddress: {
                    name: customerInfo.name,
                    phone: customerInfo.phone,
                    address: customerInfo.address,
                    lineId: customerInfo.lineId,
                    note: customerInfo.note,
                },
                shopId,
                roundId,
                customerId: customer.id,
                items: {
                    create: items.map((item) => ({
                        name: item.productName,
                        price: item.price,
                        quantity: item.quantity,
                        totalPrice: item.price * item.quantity,
                        selectedOptions: item.selectedOptions || {},
                        productId: item.productId,
                    })),
                },
            },
            include: {
                items: true,
                customer: true,
            },
        })

        // Send Telegram notification to shop owner
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: {
                name: true,
                telegramBotToken: true,
                telegramChatId: true,
            }
        })

        if (shop?.telegramBotToken && shop?.telegramChatId) {
            notifyNewOrder(
                shop.telegramBotToken,
                shop.telegramChatId,
                shop.name,
                {
                    code: order.code,
                    customerName: customerInfo.name,
                    customerPhone: customerInfo.phone,
                    totalAmount,
                    shippingCost,
                    grandTotal,
                    items: items.map(item => ({
                        name: item.productName,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            ).catch(err => console.error('Telegram notification failed:', err))
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: 'Checkout failed' },
            { status: 500 }
        )
    }
}
