import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const shop = await prisma.shop.findUnique({
            where: { slug },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                rounds: {
                    where: {
                        status: 'OPEN',
                        closesAt: {
                            gte: new Date(),
                        },
                    },
                    orderBy: {
                        opensAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        })

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        if (!shop.isActive) {
            return NextResponse.json({ error: 'Shop is inactive' }, { status: 403 })
        }

        return NextResponse.json(shop)
    } catch (error) {
        console.error('Error fetching shop:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
