import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ shopId: string }>
}

// GET public shop settings (for customer checkout)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { shopId } = await params

        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: {
                id: true,
                name: true,
                bankInfo: true,
                shippingRates: true,
            }
        })

        if (!shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            bankInfo: shop.bankInfo,
            shippingRates: shop.shippingRates,
        })
    } catch (error) {
        console.error('Error fetching shop settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}
