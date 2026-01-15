import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NewRoundClient } from './NewRoundClient'

async function getShops() {
    const session = await auth()
    if (!session?.user?.email) {
        return []
    }

    return await prisma.shop.findMany({
        where: { owner: { email: session.user.email } },
        select: { id: true, name: true }
    })
}

import { cookies } from 'next/headers'

export default async function NewRoundPage() {
    const shops = await getShops()
    const cookieStore = await cookies()
    const defaultShopId = cookieStore.get('selectedShopId')?.value

    return <NewRoundClient shops={shops} defaultShopId={defaultShopId} />
}
