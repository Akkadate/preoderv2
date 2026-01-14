import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NewProductClient } from './NewProductClient'

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

export default async function NewProductPage() {
    const shops = await getShops()
    return <NewProductClient shops={shops} />
}
