import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, ShoppingBag, DollarSign } from 'lucide-react'
import { getSelectedShopIds } from '@/lib/auth-utils'

async function getCustomers() {
    const shopIds = await getSelectedShopIds()
    if (!shopIds || shopIds.length === 0) {
        return []
    }

    const customers = await prisma.customer.findMany({
        where: {
            shopId: { in: shopIds }
        },
        include: {
            shop: { select: { name: true } },
            orders: {
                select: {
                    grandTotal: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
            _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    return customers.map((customer) => ({
        ...customer,
        totalSpent: customer.orders.reduce(
            (sum, order) => sum + Number(order.grandTotal),
            0
        ),
        lastOrder: customer.orders[0]?.createdAt || null,
    }))
}

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">ลูกค้า</h1>
                <p className="text-muted-foreground">จัดการข้อมูลลูกค้าทั้งหมด</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            {customers.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer List */}
            <div className="grid gap-4">
                {customers.map((customer) => (
                    <Card key={customer.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {customer.contactInfo}
                                    </p>
                                    {customer.address && (
                                        <p className="text-sm text-muted-foreground">
                                            📍 {customer.address}
                                        </p>
                                    )}
                                    <Badge variant="outline">{customer.shop.name}</Badge>
                                </div>

                                <div className="text-right space-y-1">
                                    <div className="flex items-center gap-1 justify-end">
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{customer._count.orders} ออเดอร์</span>
                                    </div>
                                    <div className="flex items-center gap-1 justify-end">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">฿{customer.totalSpent.toLocaleString()}</span>
                                    </div>
                                    {customer.lastOrder && (
                                        <p className="text-xs text-muted-foreground">
                                            ซื้อล่าสุด: {new Date(customer.lastOrder).toLocaleDateString('th-TH')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {customers.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            ยังไม่มีข้อมูลลูกค้า
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
