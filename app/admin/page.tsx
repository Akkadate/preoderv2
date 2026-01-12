import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
    const [orders, products, customers, rounds] = await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.customer.count(),
        prisma.round.findMany({
            where: { status: 'OPEN' },
            include: {
                shop: { select: { name: true, slug: true } },
                _count: { select: { orders: true } },
            },
        }),
    ])

    const totalRevenue = await prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { status: { in: ['PAID_WAITING', 'CONFIRMED', 'SHIPPED', 'COMPLETED'] } },
    })

    return {
        orders,
        products,
        customers,
        rounds,
        revenue: Number(totalRevenue._sum.grandTotal || 0),
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">ภาพรวมร้านค้าของคุณ</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{stats.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">คำสั่งซื้อ</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.orders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">สินค้า</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.products}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ลูกค้า</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Rounds */}
            <div>
                <h2 className="text-xl font-semibold mb-4">รอบที่เปิดอยู่</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.rounds.map((round) => (
                        <Link key={round.id} href={`/admin/rounds/${round.id}`}>
                            <Card className="hover:border-primary cursor-pointer transition-colors">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{round.name}</CardTitle>
                                        <Badge variant="default">OPEN</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{round.shop.name}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm space-y-1">
                                        <p>ปิดรับ: {new Date(round.closesAt).toLocaleString('th-TH')}</p>
                                        <p className="font-medium">{round._count.orders} คำสั่งซื้อ</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {stats.rounds.length === 0 && (
                        <p className="text-muted-foreground col-span-full">ไม่มีรอบที่เปิดอยู่</p>
                    )}
                </div>
            </div>
        </div>
    )
}
