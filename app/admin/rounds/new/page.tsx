import { prisma } from '@/lib/prisma'
import { NewRoundClient } from './NewRoundClient'

async function getShops() {
    return await prisma.shop.findMany({
        select: { id: true, name: true }
    })
}

export default async function NewRoundPage() {
    const shops = await getShops()
    return <NewRoundClient shops={shops} />
}
