import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSelectedShopIds } from '@/lib/auth-utils'

// GET all products for admin (filtered by user's shops)
export async function GET() {
    try {
        const shopIds = await getSelectedShopIds()
        if (!shopIds) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const products = await prisma.product.findMany({
            where: {
                shopId: { in: shopIds }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                shop: {
                    select: { name: true, slug: true }
                },
                _count: {
                    select: { orderItems: true }
                }
            }
        })

        // Convert Decimal to number for JSON serialization
        const serializedProducts = products.map(p => ({
            ...p,
            price: Number(p.price),
            soldCount: p._count.orderItems
        }))

        return NextResponse.json(serializedProducts)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

// POST create new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { name, description, price, costPrice, images, shopId, isAvailable, limitPerRound, optionsConfig } = body

        if (!name || !price || !shopId) {
            return NextResponse.json(
                { error: 'Name, price, and shopId are required' },
                { status: 400 }
            )
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || null,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                images: images || [],
                shopId,
                isAvailable: isAvailable ?? true,
                limitPerRound: limitPerRound ? parseInt(limitPerRound) : null,
                optionsConfig: optionsConfig || null,
            },
        })

        return NextResponse.json({
            ...product,
            price: Number(product.price)
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
