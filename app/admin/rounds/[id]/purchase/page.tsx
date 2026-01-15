import { prisma } from '@/lib/prisma'
import { getSelectedShopIds } from '@/lib/auth-utils'
import { PurchaseListView } from '@/components/PurchaseListView'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PurchaseViewPage(props: PageProps) {
    const params = await props.params
    const roundId = params.id

    // 1. Verify Access
    const shopIds = await getSelectedShopIds()
    if (!shopIds || shopIds.length === 0) {
        redirect('/admin')
    }

    // 2. Get Round Info
    const round = await prisma.round.findUnique({
        where: { id: roundId },
        include: { shop: true }
    })

    if (!round) {
        notFound()
    }

    // Security check: Ensure round belongs to one of the selected shops
    if (!shopIds.includes(round.shopId)) {
        redirect('/admin')
    }

    // 3. Fetch Items (Same logic as API)
    const items = await prisma.orderItem.findMany({
        where: {
            order: {
                roundId: roundId,
                status: { in: ['PAID_WAITING', 'CONFIRMED', 'SHIPPED', 'COMPLETED'] },
                shopId: { in: shopIds }
            }
        },
        include: {
            product: {
                select: {
                    name: true,
                    costPrice: true
                }
            }
        }
    })

    // 4. Aggregate Data
    const aggregated: Record<string, { name: string, qty: number, cost: number }> = {}

    for (const item of items) {
        const key = item.name || 'สินค้าไม่ระบุชื่อ'

        if (!aggregated[key]) {
            const prod = (item as any).product
            let cost = 0
            if (prod?.costPrice) {
                cost = Number(prod.costPrice)
                if (isNaN(cost)) cost = 0
            }

            aggregated[key] = {
                name: key,
                qty: 0,
                cost: cost
            }
        }
        aggregated[key].qty += (Number(item.quantity) || 0)
    }

    const rows = Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PurchaseListView
                items={rows}
                round={{
                    name: round.name,
                    shop: { name: round.shop.name }
                }}
            />
        </div>
    )
}
