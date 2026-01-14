import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

/**
 * Get the shop IDs owned by the currently logged-in user
 * Returns null if user is not authenticated
 */
export async function getUserShopIds(): Promise<string[] | null> {
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    const shops = await prisma.shop.findMany({
        where: {
            owner: {
                email: session.user.email
            }
        },
        select: {
            id: true
        }
    })

    return shops.map(shop => shop.id)
}

/**
 * Get selected shop IDs based on cookie selection
 * Returns all user's shops if "all" is selected, or just the selected shop
 */
export async function getSelectedShopIds(): Promise<string[] | null> {
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    // Get all user's shops first
    const allShops = await prisma.shop.findMany({
        where: { owner: { email: session.user.email } },
        select: { id: true }
    })

    if (allShops.length === 0) {
        return []
    }

    // Read selected shop from cookie
    const cookieStore = await cookies()
    const selectedShopId = cookieStore.get('selectedShopId')?.value

    // If no selection or "all", return all shops
    if (!selectedShopId || selectedShopId === 'all') {
        return allShops.map(shop => shop.id)
    }

    // Verify the selected shop belongs to this user
    const isValidShop = allShops.some(shop => shop.id === selectedShopId)
    if (!isValidShop) {
        return allShops.map(shop => shop.id)
    }

    return [selectedShopId]
}

/**
 * Get user's shops with basic info for dropdowns
 */
export async function getUserShops() {
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    return await prisma.shop.findMany({
        where: {
            owner: {
                email: session.user.email
            }
        },
        select: {
            id: true,
            name: true,
            slug: true,
            type: true
        }
    })
}
