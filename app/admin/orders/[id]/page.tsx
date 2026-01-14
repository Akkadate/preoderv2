import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, MapPin, Phone, MessageSquare, Package, CreditCard, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrderActions } from './OrderActions'
import { ImageDialog } from '@/components/image-dialog'
import { LocationViewWrapper } from '@/components/LocationViewWrapper'

interface PageProps {
    params: Promise<{ id: string }>
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

async function getOrder(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            round: {
                include: {
                    shop: { select: { name: true, slug: true } },
                },
            },
            items: {
                include: {
                    product: { select: { images: true } },
                },
            },
        },
    })

    if (!order) return null

    // Get adjacent orders in the same round (assuming sorted by createdAt desc)
    const [previousOrder, nextOrder] = await Promise.all([
        // Previous in list = Newer order (createdAt > current)
        prisma.order.findFirst({
            where: {
                roundId: order.roundId,
                createdAt: { gt: order.createdAt }
            },
            orderBy: { createdAt: 'asc' },
            select: { id: true }
        }),
        // Next in list = Older order (createdAt < current)
        prisma.order.findFirst({
            where: {
                roundId: order.roundId,
                createdAt: { lt: order.createdAt }
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true }
        })
    ])

    return { ...order, previousOrderId: previousOrder?.id, nextOrderId: nextOrder?.id }
}

export default async function OrderDetailPage({ params }: PageProps) {
    const resolvedParams = await params
    const order = await getOrder(resolvedParams.id)

    if (!order) {
        notFound()
    }

    const shippingAddress = order.shippingAddress as {
        name?: string
        phone?: string
        address?: string
        lineId?: string
        note?: string
        location?: { lat: number; lng: number } | null
    } | null

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h1 className="text-xl sm:text-2xl font-bold font-mono truncate">{order.code}</h1>
                            <Badge variant={statusVariants[order.status]} className="text-xs sm:text-sm whitespace-nowrap">
                                {statusLabels[order.status]}
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {order.round.shop.name} • {order.round.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        disabled={!order.previousOrderId}
                        asChild={!!order.previousOrderId}
                    >
                        {order.previousOrderId ? (
                            <Link href={`/admin/orders/${order.previousOrderId}`}>
                                ← <span className="sr-only sm:not-sr-only sm:inline ml-1">ก่อนหน้า</span>
                            </Link>
                        ) : (
                            <span>← <span className="sr-only sm:not-sr-only sm:inline ml-1">ก่อนหน้า</span></span>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        disabled={!order.nextOrderId}
                        asChild={!!order.nextOrderId}
                    >
                        {order.nextOrderId ? (
                            <Link href={`/admin/orders/${order.nextOrderId}`}>
                                <span className="sr-only sm:not-sr-only sm:inline mr-1">ถัดไป</span> →
                            </Link>
                        ) : (
                            <span><span className="sr-only sm:not-sr-only sm:inline mr-1">ถัดไป</span> →</span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                รายการสินค้า ({order.items.length} รายการ)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                                        {item.product.images && item.product.images.length > 0 && (
                                            <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium">{item.name}</h4>
                                            {item.selectedOptions && Object.keys(item.selectedOptions as object).length > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    {Object.entries(item.selectedOptions as object)
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(', ')}
                                                </p>
                                            )}
                                            <p className="text-sm mt-1">
                                                ฿{Number(item.price).toLocaleString()} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                ฿{Number(item.totalPrice).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ค่าสินค้า</span>
                                    <span>฿{Number(order.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                                    <span>฿{Number(order.shippingCost).toLocaleString()}</span>
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>ส่วนลด</span>
                                        <span>-฿{Number(order.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>รวมทั้งหมด</span>
                                    <span>฿{Number(order.grandTotal).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                การชำระเงิน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">วิธีชำระเงิน</p>
                                    <p className="font-medium">
                                        {order.paymentMethod === 'BANK_TRANSFER' ? 'โอนเงิน' : order.paymentMethod}
                                    </p>
                                </div>
                                {order.slipImage && (
                                    <div className="w-20 h-20 bg-muted rounded overflow-hidden">
                                        <ImageDialog
                                            src={order.slipImage}
                                            alt="สลิปโอนเงิน"
                                            className="w-full h-full"
                                        />
                                    </div>
                                )}
                            </div>
                            {order.paidAt && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    ชำระเมื่อ: {new Date(order.paidAt).toLocaleString('th-TH')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                ข้อมูลลูกค้า
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.customer && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{order.customer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{order.customer.contactInfo}</span>
                                    </div>
                                </>
                            )}
                            {shippingAddress && (
                                <>
                                    {shippingAddress.lineId && (
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <span>{shippingAddress.lineId}</span>
                                        </div>
                                    )}
                                    {shippingAddress.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <span className="text-sm">{shippingAddress.address}</span>
                                        </div>
                                    )}
                                    {shippingAddress.note && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-sm">
                                            <strong>หมายเหตุ:</strong> {shippingAddress.note}
                                        </div>
                                    )}
                                    {shippingAddress.location && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                ตำแหน่งบนแผนที่
                                            </p>
                                            <LocationViewWrapper
                                                location={shippingAddress.location}
                                                size={150}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                ไทม์ไลน์
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">สร้างเมื่อ</span>
                                <span>{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">อัพเดตล่าสุด</span>
                                <span>{new Date(order.updatedAt).toLocaleString('th-TH')}</span>
                            </div>
                            {order.trackingCode && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">เลขพัสดุ</span>
                                    <code className="font-mono">{order.trackingCode}</code>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>การดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderActions
                                orderId={order.id}
                                currentStatus={order.status}
                                slipImage={order.slipImage}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
