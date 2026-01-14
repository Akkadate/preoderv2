import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { EditProductClient } from './EditProductClient'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id }
    })
    return product
}

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

export default async function EditProductPage({ params }: PageProps) {
    const { id } = await params
    const [product, shops] = await Promise.all([
        getProduct(id),
        getShops()
    ])

    if (!product) {
        notFound()
    }

    // Transform Decimal to number for client component
    const serializedProduct = {
        ...product,
        price: Number(product.price)
    }

    return <EditProductClient product={serializedProduct} shops={shops} />
}
