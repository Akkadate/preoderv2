import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { auth } from '@/auth'
import { Plus, Store } from 'lucide-react'
import { ShopCard } from './ShopCard'

async function getShops() {
    const session = await auth()
    if (!session?.user?.email) {
        return []
    }

    return await prisma.shop.findMany({
        where: { owner: { email: session.user.email } },
        include: {
            _count: { select: { products: true, rounds: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ShopsPage() {
    const shops = await getShops()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">ร้านค้าของฉัน</h1>
                    <p className="text-muted-foreground">จัดการร้านค้าทั้งหมดของคุณ</p>
                </div>
                <Link href="/admin/shops/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        สร้างร้านใหม่
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} />
                ))}

                {shops.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center">
                            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-semibold mb-2">ยังไม่มีร้านค้า</h3>
                            <p className="text-muted-foreground mb-4">สร้างร้านค้าแรกของคุณเลย!</p>
                            <Link href="/admin/shops/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    สร้างร้านใหม่
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
