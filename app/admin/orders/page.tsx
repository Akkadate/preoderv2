import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getSelectedShopIds } from '@/lib/auth-utils'
import { CopyOrderUrlButton } from '@/components/CopyOrderUrlButton'
import { ExportButton } from '@/components/ExportButton'
import { RoundFilter } from '@/components/RoundFilter'
import { StatusFilter } from '@/components/StatusFilter'
import { FileImage, Printer } from 'lucide-react'

interface OrdersPageProps {
    searchParams: Promise<{
        roundId?: string
        status?: string
    }>
}

async function getOrders(shopIds: string[], roundId?: string, status?: string) {
    const where: any = {
        round: {
            shopId: { in: shopIds }
        }
    }

    if (roundId && roundId !== 'all') {
        where.roundId = roundId
    }

    if (status && status !== 'all') {
        where.status = status
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            customer: true,
            round: {
                select: {
                    name: true,
                    shop: { select: { name: true } }
                }
            },
            items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    return orders
}

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

const statusLabels: Record<string, string> = {
    PENDING: 'รอชำระเงิน',
    PAID_WAITING: 'รอยืนยัน',
    CONFIRMED: 'ยืนยันแล้ว',
    SHIPPED: 'กำลังจัดส่ง',
    COMPLETED: 'สำเร็จ',
    CANCELLED: 'ยกเลิก',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'outline',
    PAID_WAITING: 'secondary',
    CONFIRMED: 'default',
    SHIPPED: 'default',
    COMPLETED: 'default',
    CANCELLED: 'destructive',
}

export default async function OrdersPage(props: OrdersPageProps) {
    const searchParams = await props.searchParams
    const shopIds = await getSelectedShopIds()

    if (!shopIds || shopIds.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">ไม่พบร้านค้าที่คุณดูแล</div>
    }

    const rounds = await getRounds(shopIds)
    const orders = await getOrders(shopIds, searchParams.roundId, searchParams.status)

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">รายการคำสั่งซื้อ</h1>
                    <p className="text-muted-foreground">จัดการคำสั่งซื้อทั้งหมด</p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap justify-end">
                    <div className="w-full sm:w-auto min-w-[150px] max-w-[200px]">
                        <StatusFilter />
                    </div>
                    <div className="w-full sm:w-auto min-w-[200px] max-w-[300px]">
                        <RoundFilter rounds={rounds} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {searchParams.roundId && searchParams.roundId !== 'all' && (
                            <>
                                <Link href={`/print/batch-labels/${searchParams.roundId}`} target="_blank">
                                    <Button variant="outline">
                                        <Printer className="mr-2 h-4 w-4" />
                                        พิมพ์ใบปะหน้าทั้งรอบ
                                    </Button>
                                </Link>
                                <Link href={`/admin/rounds/${searchParams.roundId}/purchase`}>
                                    <Button variant="outline">
                                        <FileImage className="mr-2 h-4 w-4" />
                                        ดูใบสั่งของ
                                    </Button>
                                </Link>
                                <ExportButton
                                    endpoint="/api/admin/export/purchase"
                                    filename={`purchase_list_${searchParams.roundId}.xlsx`}
                                    label="Excel สั่งของ"
                                    variant="outline"
                                    extraParams={{ roundId: searchParams.roundId }}
                                />
                            </>
                        )}
                        <ExportButton
                            endpoint="/api/admin/export/orders"
                            filename={`orders_${searchParams.roundId || 'all'}.xlsx`}
                            label="รายการคำสั่งซื้อ"
                            extraParams={{ roundId: searchParams.roundId || '' }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono font-bold">{order.code}</code>
                                        <Badge variant={statusVariants[order.status]}>
                                            {statusLabels[order.status]}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {order.customer?.name || 'ลูกค้า'} • {order.round?.name} • {order.round?.shop?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleString('th-TH')}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        ฿{Number(order.grandTotal).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.items.length} รายการ
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Link href={`/admin/orders/${order.id}`}>
                                    <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                                </Link>
                                <CopyOrderUrlButton orderId={order.id} />
                                {order.status === 'PENDING' && (
                                    <Button variant="default" size="sm">ยืนยันการชำระเงิน</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {orders.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            ไม่พบคำสั่งซื้อในรอบนี้
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
