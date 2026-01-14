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

export default async function NewRoundPage() {
    const shops = await getShops()
    return <NewRoundClient shops={shops} />
}
