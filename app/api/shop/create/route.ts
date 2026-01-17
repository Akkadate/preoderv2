import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Helper function to generate slug from shop name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙]+/g, '-') // Replace non-alphanumeric (including Thai) with dash
        .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
        .substring(0, 50) // Limit length
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (await prisma.shop.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
    }

    return slug
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'กรุณาเข้าสู่ระบบก่อน' },
                { status: 401 }
            )
        }

        const { name, slug: customSlug, type, description } = await request.json()

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'กรุณากรอกชื่อร้าน' },
                { status: 400 }
            )
        }

        // Check if user already has a shop
        const existingShop = await prisma.shop.findFirst({
            where: { ownerId: session.user.id },
        })

        if (existingShop) {
            return NextResponse.json(
                { error: 'คุณมีร้านค้าอยู่แล้ว', shopId: existingShop.id },
                { status: 400 }
            )
        }

        // Generate or validate slug
        let finalSlug: string
        if (customSlug) {
            // Validate custom slug format
            const slugRegex = /^[a-z0-9-]+$/
            if (!slugRegex.test(customSlug)) {
                return NextResponse.json(
                    { error: 'URL ร้านต้องเป็นภาษาอังกฤษตัวเล็ก ตัวเลข หรือขีด (-) เท่านั้น' },
                    { status: 400 }
                )
            }

            // Check if slug is taken
            const existingSlug = await prisma.shop.findUnique({
                where: { slug: customSlug },
            })

            if (existingSlug) {
                return NextResponse.json(
                    { error: 'URL นี้ถูกใช้งานแล้ว กรุณาเลือกใหม่' },
                    { status: 400 }
                )
            }

            finalSlug = customSlug
        } else {
            // Auto-generate slug from name
            const baseSlug = generateSlug(name)
            finalSlug = await ensureUniqueSlug(baseSlug || 'shop')
        }

        // Create shop with Free plan defaults
        const shop = await prisma.shop.create({
            data: {
                name,
                slug: finalSlug,
                type: type || 'BUYING_AGENT',
                description: description || undefined,
                ownerId: session.user.id,
                isActive: true,
            },
        })

        return NextResponse.json({
            success: true,
            shop: {
                id: shop.id,
                name: shop.name,
                slug: shop.slug,
                type: shop.type,
            },
        })
    } catch (error) {
        console.error('Shop creation error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
            { status: 500 }
        )
    }
}
