import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        const dataUri = `data:${file.type};base64,${base64}`

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'pre-order/slips',
            resource_type: 'auto',
            public_id: `${orderId}-${Date.now()}`,
        })

        // Update order with slip image URL
        const slipUrl = result.secure_url
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
