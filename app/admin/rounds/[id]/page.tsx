import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Package, ShoppingBag, Users, Copy } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getRoundData(id: string) {
    const round = await prisma.round.findUnique({
        where: { id },
        include: {
            shop: true,
            orders: {
                include: {
                    items: true,
                    customer: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!round) return null

    // Calculate consolidated shopping list
    const productTotals = new Map<string, { name: string; quantity: number; options: Map<string, number> }>()

    round.orders.forEach((order) => {
        order.items.forEach((item) => {
            const existing = productTotals.get(item.productId)
            if (existing) {
                existing.quantity += item.quantity
            } else {
                productTotals.set(item.productId, {
                    name: item.name,
                    quantity: item.quantity,
                    options: new Map(),
                })
            }
        })
    })

    const shoppingList = Array.from(productTotals.values())

    const totalRevenue = round.orders.reduce(
        (sum, order) => sum + Number(order.grandTotal),
        0
    )

    return {
        round,
        shoppingList,
        totalRevenue,
        orderCount: round.orders.length,
    }
}

export default async function RoundDetailPage({ params }: PageProps) {
    const resolvedParams = await params
    const data = await getRoundData(resolvedParams.id)

    if (!data) {
        notFound()
    }

    const { round, shoppingList, totalRevenue, orderCount } = data
    const statusColor = round.status === 'OPEN' ? 'default' : 'secondary'

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold">{round.name}</h1>
                        <Badge variant={statusColor}>{round.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">{round.shop.name}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">คำสั่งซื้อ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">ปิดรับออเดอร์</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-medium">
                            {new Date(round.closesAt).toLocaleString('th-TH')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Consolidated Shopping List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            รายการสรุปสินค้า
                        </CardTitle>
                        <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {shoppingList.length > 0 ? (
                            <div className="space-y-3">
                                {shoppingList.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                        <span className="font-medium">{item.name}</span>
                                        <Badge variant="secondary" className="text-lg">
                                            {item.quantity} ชิ้น
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                ยังไม่มีคำสั่งซื้อ
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            คำสั่งซื้อล่าสุด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {round.orders.length > 0 ? (
                            <div className="space-y-4">
                                {round.orders.slice(0, 5).map((order) => (
                                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                                        <div className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <code className="text-sm font-mono">{order.code}</code>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.customer?.name || 'ลูกค้า'}
                                                    </p>
                                                </div>
                                                <Badge variant={order.status === 'PENDING' ? 'outline' : 'default'}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>{order.items.length} รายการ</span>
                                                <span className="font-medium">฿{Number(order.grandTotal).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {round.orders.length > 5 && (
                                    <Link href={`/admin/orders?roundId=${round.id}`}>
                                        <Button variant="outline" className="w-full">
                                            ดูทั้งหมด ({round.orders.length})
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                ยังไม่มีคำสั่งซื้อ
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
