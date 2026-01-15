import { prisma } from '@/lib/prisma'
import { getSelectedShopIds } from '@/lib/auth-utils'
import { FinanceDashboard } from '@/components/FinanceDashboard'

async function getRounds(shopIds: string[]) {
    return prisma.round.findMany({
        where: {
            shopId: { in: shopIds }
        },
        include: {
            shop: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    })
}

export default async function FinancePage() {
    const shopIds = await getSelectedShopIds()

    if (!shopIds || shopIds.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">ไม่พบร้านค้าที่คุณดูแล</div>
    }

    const rounds = await getRounds(shopIds)

    return <FinanceDashboard rounds={rounds} />
}
