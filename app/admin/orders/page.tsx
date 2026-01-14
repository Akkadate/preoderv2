import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getSelectedShopIds } from '@/lib/auth-utils'

async function getOrders() {
    const shopIds = await getSelectedShopIds()
    if (!shopIds || shopIds.length === 0) {
        return []
    }

    const orders = await prisma.order.findMany({
        where: {
            round: {
                shopId: { in: shopIds }
            }
        },
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

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">คำสั่งซื้อ</h1>
                <p className="text-muted-foreground">จัดการคำสั่งซื้อทั้งหมด</p>
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
                            ยังไม่มีคำสั่งซื้อ
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
