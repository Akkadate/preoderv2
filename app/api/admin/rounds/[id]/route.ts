import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single round
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const round = await prisma.round.findUnique({
            where: { id },
            include: {
                shop: {
                    select: { id: true, name: true, slug: true }
                },
                _count: {
                    select: { orders: true }
                }
            }
        })

        if (!round) {
            return NextResponse.json(
                { error: 'Round not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(round)
    } catch (error) {
        console.error('Error fetching round:', error)
        return NextResponse.json(
            { error: 'Failed to fetch round' },
            { status: 500 }
        )
    }
}

// PUT update round
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()

        const { name, opensAt, closesAt, shippingStart, pickupDate, status } = body

        const round = await prisma.round.update({
            where: { id },
            data: {
                name: name || undefined,
                opensAt: opensAt ? new Date(opensAt) : undefined,
                closesAt: closesAt ? new Date(closesAt) : undefined,
                shippingStart: shippingStart !== undefined ? (shippingStart ? new Date(shippingStart) : null) : undefined,
                pickupDate: pickupDate !== undefined ? (pickupDate ? new Date(pickupDate) : null) : undefined,
                status: status || undefined,
            },
            include: {
                shop: {
                    select: { name: true, slug: true }
                }
            }
        })

        return NextResponse.json(round)
    } catch (error) {
        console.error('Error updating round:', error)
        return NextResponse.json(
            { error: 'Failed to update round' },
            { status: 500 }
        )
    }
}

// DELETE round
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Check if round has any orders
        const ordersCount = await prisma.order.count({
            where: { roundId: id }
        })

        if (ordersCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete round with ${ordersCount} existing orders. Close it instead.` },
                { status: 400 }
            )
        }

        await prisma.round.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting round:', error)
        return NextResponse.json(
            { error: 'Failed to delete round' },
            { status: 500 }
        )
    }
}
