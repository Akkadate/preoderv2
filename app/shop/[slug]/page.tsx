import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ShopHeader from './components/ShopHeader'
import ProductGrid from './components/ProductGrid'
import RoundSelector from './components/RoundSelector'
import { Metadata } from 'next'

export interface PageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ roundId?: string }>
}

async function getShopData(slug: string) {
    const shop = await prisma.shop.findUnique({
        where: { slug: slug },
        include: {
            rounds: {
                where: {
                    status: 'OPEN',
                    closesAt: {
                        gte: new Date(),
                    },
                },
                orderBy: {
                    opensAt: 'desc',
                },
            },
        },
    })

    if (!shop || !shop.isActive) {
        return null
    }

    return shop
}

async function getProducts(shopId: string, roundId?: string) {
    const products = await prisma.product.findMany({
        where: {
            shopId: shopId,
            isAvailable: true,
        },
        include: {
            orderItems: roundId
                ? {
                    where: {
                        order: {
                            roundId: roundId,
                        },
                    },
                    select: {
                        quantity: true,
                    },
                }
                : false,
        },
    })

    return products.map((product) => {
        const soldCount = product.orderItems
            ? product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
            : 0
        const remaining = product.limitPerRound
            ? product.limitPerRound - soldCount
            : null

        return {
            ...product,
            // Convert Decimal to number for client component serialization
            price: Number(product.price),
            costPrice: product.costPrice ? Number(product.costPrice) : null,
            // Convert dates to ISO strings
            createdAt: product.createdAt.toISOString(),
            soldCount,
            remaining,
            isInStock: product.limitPerRound ? remaining! > 0 : true,
        }
    })
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params
    const shop = await prisma.shop.findUnique({
        where: { slug: resolvedParams.slug },
        select: { name: true, description: true, favicon: true }
    })

    if (!shop) {
        return {
            title: 'ไม่พบร้านค้า'
        }
    }

    return {
        title: shop.name,
        description: shop.description || `สินค้าพรีออเดอร์จากร้าน ${shop.name}`,
        icons: shop.favicon ? {
            icon: `${shop.favicon}?v=${new Date().getTime()}`
        } : undefined,
    }
}

export default async function ShopPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams

    const shop = await getShopData(resolvedParams.slug)

    if (!shop) {
        notFound()
    }

    const activeRound = resolvedSearchParams.roundId
        ? shop.rounds.find((r) => r.id === resolvedSearchParams.roundId)
        : shop.rounds[0]

    const products = activeRound
        ? await getProducts(shop.id, activeRound.id)
        : []

    return (
        <div className="min-h-screen bg-background">
            <ShopHeader shop={shop} />

            {shop.rounds.length > 0 ? (
                <>
                    <RoundSelector
                        rounds={shop.rounds}
                        activeRound={activeRound}
                        shopType={shop.type}
                    />

                    <main className="container mx-auto px-4 py-8">
                        <ProductGrid
                            products={products}
                            shopType={shop.type}
                            shopId={shop.id}
                            roundId={activeRound?.id || ''}
                        />
                    </main>
                </>
            ) : (
                <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-semibold text-muted-foreground">
                        ไม่มีรอบการขายที่เปิดอยู่ในขณะนี้
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        กรุณากลับมาตรวจสอบใหม่ในภายหลัง
                    </p>
                </div>
            )}
        </div>
    )
}
