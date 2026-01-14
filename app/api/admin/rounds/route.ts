import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSelectedShopIds } from '@/lib/auth-utils'

// GET all rounds for admin (filtered by user's shops)
export async function GET() {
    try {
        const shopIds = await getSelectedShopIds()
        if (!shopIds) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const rounds = await prisma.round.findMany({
            where: {
                shopId: { in: shopIds }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                shop: {
                    select: { id: true, name: true, slug: true, type: true }
                },
                _count: {
                    select: { orders: true }
                }
            }
        })

        return NextResponse.json(rounds)
    } catch (error) {
        console.error('Error fetching rounds:', error)
        return NextResponse.json(
            { error: 'Failed to fetch rounds' },
            { status: 500 }
        )
    }
}

// POST create new round
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { name, shopId, opensAt, closesAt, shippingStart, pickupDate, status } = body

        if (!name || !shopId || !opensAt || !closesAt) {
            return NextResponse.json(
                { error: 'Name, shopId, opensAt, and closesAt are required' },
                { status: 400 }
            )
        }

        const round = await prisma.round.create({
            data: {
                name,
                shopId,
                opensAt: new Date(opensAt),
                closesAt: new Date(closesAt),
                shippingStart: shippingStart ? new Date(shippingStart) : null,
                pickupDate: pickupDate ? new Date(pickupDate) : null,
                status: status || 'OPEN',
            },
            include: {
                shop: {
                    select: { name: true, slug: true }
                }
            }
        })

        return NextResponse.json(round, { status: 201 })
    } catch (error) {
        console.error('Error creating round:', error)
        return NextResponse.json(
            { error: 'Failed to create round' },
            { status: 500 }
        )
    }
}
