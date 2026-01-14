import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

// GET shop settings
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Read selected shop from cookie
        const cookieStore = await cookies()
        const selectedShopId = cookieStore.get('selectedShopId')?.value

        // Build where clause
        const whereClause: any = {
            owner: { email: session.user.email }
        }

        // If a specific shop is selected (not "all"), get that one
        if (selectedShopId && selectedShopId !== 'all') {
            whereClause.id = selectedShopId
        }

        // Get the shop
        const shop = await prisma.shop.findFirst({
            where: whereClause,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logo: true,
                favicon: true,
                bankInfo: true,
                shippingRates: true,
                telegramBotToken: true,
                telegramChatId: true,
            }
        })

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        return NextResponse.json(shop)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// PUT update shop settings
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { bankInfo, shippingRates, name, description, logo, favicon, telegramBotToken, telegramChatId } = body

        // Read selected shop from cookie
        const cookieStore = await cookies()
        const selectedShopId = cookieStore.get('selectedShopId')?.value

        // Build where clause
        const whereClause: any = {
            owner: { email: session.user.email }
        }

        if (selectedShopId && selectedShopId !== 'all') {
            whereClause.id = selectedShopId
        }

        // Get the shop owned by the current user
        const existingShop = await prisma.shop.findFirst({
            where: whereClause
        })

        if (!existingShop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        const updatedShop = await prisma.shop.update({
            where: { id: existingShop.id },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                logo: logo !== undefined ? logo : undefined,
                favicon: favicon !== undefined ? favicon : undefined,
                bankInfo: bankInfo !== undefined ? bankInfo : undefined,
                shippingRates: shippingRates !== undefined ? shippingRates : undefined,
                telegramBotToken: telegramBotToken !== undefined ? telegramBotToken : undefined,
                telegramChatId: telegramChatId !== undefined ? telegramChatId : undefined,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logo: true,
                // favicon: true, // Temporarily disabled until server restart
                bankInfo: true,
                shippingRates: true,
                telegramBotToken: true,
                telegramChatId: true,
            }
        })

        return NextResponse.json(updatedShop)
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
