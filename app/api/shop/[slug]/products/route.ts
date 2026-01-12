import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const searchParams = request.nextUrl.searchParams
        const roundId = searchParams.get('roundId')

        const shop = await prisma.shop.findUnique({
            where: { slug },
            select: { id: true },
        })

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        const products = await prisma.product.findMany({
            where: {
                shopId: shop.id,
                isAvailable: true,
            },
            include: {
                _count: {
                    select: {
                        orderItems: roundId
                            ? {
                                where: {
                                    order: {
                                        roundId: roundId,
                                    },
                                },
                            }
                            : undefined,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Calculate remaining stock for each product if roundId is provided
        const productsWithStock = products.map((product) => {
            const soldCount = product._count.orderItems
            const remaining = product.limitPerRound
                ? product.limitPerRound - soldCount
                : null

            return {
                ...product,
                soldCount,
                remaining,
                isInStock: product.limitPerRound ? remaining! > 0 : true,
            }
        })

        return NextResponse.json(productsWithStock)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
