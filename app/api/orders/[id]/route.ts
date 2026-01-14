import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const resolvedParams = await params

        const order = await prisma.order.findUnique({
            where: { id: resolvedParams.id },
            include: {
                items: true,
                customer: true,
                round: {
                    include: {
                        shop: {
                            select: {
                                name: true,
                                slug: true,
                                bankInfo: true,
                            },
                        },
                    },
                },
            },
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Convert Decimal to number for JSON
        const response = {
            ...order,
            totalAmount: Number(order.totalAmount),
            shippingCost: Number(order.shippingCost),
            grandTotal: Number(order.grandTotal),
            discount: Number(order.discount),
            items: order.items.map((item) => ({
                ...item,
                price: Number(item.price),
                totalPrice: Number(item.totalPrice),
            })),
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Get order error:', error)
        return NextResponse.json({ error: 'Failed to get order' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const resolvedParams = await params
        const body = await request.json()
        const { status, trackingCode } = body

        // Validate status
        const validStatuses: OrderStatus[] = [
            'PENDING',
            'PAID_WAITING',
            'CONFIRMED',
            'SHIPPED',
            'COMPLETED',
            'CANCELLED',
        ]

        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            )
        }

        // Build update data
        const updateData: any = {}

        if (status) {
            updateData.status = status
        }

        if (trackingCode !== undefined) {
            updateData.trackingCode = trackingCode
        }

        const order = await prisma.order.update({
            where: { id: resolvedParams.id },
            data: updateData,
            include: {
                customer: true,
                items: true,
                round: {
                    include: {
                        shop: { select: { name: true } },
                    },
                },
            },
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error('Update order error:', error)
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        )
    }
}
