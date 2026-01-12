import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('slip') as File
        const orderId = formData.get('orderId') as string

        if (!file || !orderId) {
            return NextResponse.json(
                { error: 'Missing file or orderId' },
                { status: 400 }
            )
        }

        // Verify order exists
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'slips')
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${orderId}-${Date.now()}.${ext}`
        const filepath = join(uploadsDir, filename)

        // Save file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Update order with slip image path
        const slipUrl = `/uploads/slips/${filename}`
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                slipImage: slipUrl,
                status: 'PAID_WAITING',
                paidAt: new Date(),
            },
            include: {
                items: true,
                round: {
                    include: {
                        shop: {
                            select: {
                                name: true,
                                bankInfo: true,
                            },
                        },
                    },
                },
            },
        })

        // Convert Decimal to number
        const response = {
            ...updatedOrder,
            totalAmount: Number(updatedOrder.totalAmount),
            shippingCost: Number(updatedOrder.shippingCost),
            grandTotal: Number(updatedOrder.grandTotal),
            discount: Number(updatedOrder.discount),
            items: updatedOrder.items.map((item) => ({
                ...item,
                price: Number(item.price),
                totalPrice: Number(item.totalPrice),
            })),
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Upload slip error:', error)
        return NextResponse.json(
            { error: 'Failed to upload slip' },
            { status: 500 }
        )
    }
}
