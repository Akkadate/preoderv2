import { prisma } from '@/lib/prisma'
import { NewProductClient } from './NewProductClient'

async function getShops() {
    return await prisma.shop.findMany({
        select: { id: true, name: true }
    })
}

export default async function NewProductPage() {
    const shops = await getShops()
    return <NewProductClient shops={shops} />
}
