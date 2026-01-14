import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// GET user's shops for ShopSwitcher
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const shops = await prisma.shop.findMany({
            where: {
                owner: { email: session.user.email }
            },
            select: {
                id: true,
                name: true,
                slug: true,
                type: true
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(shops)
    } catch (error) {
        console.error('Error fetching user shops:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shops' },
            { status: 500 }
        )
    }
}

// POST create new shop
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, slug, description, type } = body

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
            )
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/
        if (!slugRegex.test(slug)) {
            return NextResponse.json(
                { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
                { status: 400 }
            )
        }

        // Check if slug is already taken
        const existingShop = await prisma.shop.findUnique({
            where: { slug }
        })
        if (existingShop) {
            return NextResponse.json(
                { error: 'This URL is already taken' },
                { status: 400 }
            )
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create shop
        const shop = await prisma.shop.create({
            data: {
                name,
                slug,
                description: description || null,
                type: type || 'BUYING_AGENT',
                ownerId: user.id,
            }
        })

        return NextResponse.json(shop, { status: 201 })
    } catch (error) {
        console.error('Error creating shop:', error)
        return NextResponse.json(
            { error: 'Failed to create shop' },
            { status: 500 }
        )
    }
}
