import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single product
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                shop: {
                    select: { name: true, slug: true }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...product,
            price: Number(product.price)
        })
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

// PUT update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()

        const { name, description, price, images, isAvailable, limitPerRound, optionsConfig } = body

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description: description || null,
                price: price ? parseFloat(price) : undefined,
                images: images || undefined,
                isAvailable: isAvailable,
                limitPerRound: limitPerRound !== undefined ? (limitPerRound ? parseInt(limitPerRound) : null) : undefined,
                optionsConfig: optionsConfig !== undefined ? optionsConfig : undefined,
            },
        })

        return NextResponse.json({
            ...product,
            price: Number(product.price)
        })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Check if product has any orders
        const orderItemsCount = await prisma.orderItem.count({
            where: { productId: id }
        })

        if (orderItemsCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete product with existing orders. Disable it instead.' },
                { status: 400 }
            )
        }

        await prisma.product.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
