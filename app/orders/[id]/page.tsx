'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
    Copy,
    CheckCircle,
    Clock,
    Package,
    Upload,
    CreditCard,
    Truck,
    PartyPopper
} from 'lucide-react'
import Link from 'next/link'

interface OrderData {
    id: string
    code: string
    totalAmount: number
    shippingCost: number
    grandTotal: number
    status: string
    paymentMethod: string
    slipImage: string | null
    trackingCode: string | null
    createdAt: string
    items: Array<{
        id: string
        name: string
        price: number
        quantity: number
        totalPrice: number
    }>
    round: {
        name: string
        shop: {
            name: string
            bankInfo: {
                bankName: string
                accNo: string
                accName: string
            } | null
        }
    }
}

const statusSteps = [
    { key: 'PENDING', label: 'รอชำระเงิน', icon: Clock },
    { key: 'PAID_WAITING', label: 'รอยืนยัน', icon: CreditCard },
    { key: 'CONFIRMED', label: 'เตรียมของ', icon: Package },
    { key: 'SHIPPED', label: 'จัดส่งแล้ว', icon: Truck },
    { key: 'COMPLETED', label: 'สำเร็จ', icon: PartyPopper },
]

export default function OrderTrackingPage() {
    const params = useParams()
    const [order, setOrder] = useState<OrderData | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [slipPreview, setSlipPreview] = useState<string | null>(null)

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await fetch(`/api/orders/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrder(data)
                    if (data.slipImage) {
                        setSlipPreview(data.slipImage)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch order:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [params.id])

    const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onload = (e) => setSlipPreview(e.target?.result as string)
        reader.readAsDataURL(file)

        // Upload
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('slip', file)
            formData.append('orderId', params.id as string)

            const res = await fetch('/api/orders/upload-slip', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                const updated = await res.json()
                setOrder(updated)
                alert('อัพโหลดสลิปสำเร็จ! รอร้านค้ายืนยัน')
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('อัพโหลดไม่สำเร็จ กรุณาลองใหม่')
        } finally {
            setUploading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>กำลังโหลด...</p>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">ไม่พบคำสั่งซื้อ</h1>
                    <Link href="/">
                        <Button>กลับหน้าหลัก</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status)
    const bankInfo = order.round.shop.bankInfo

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">ติดตามคำสั่งซื้อ</h1>
                    <div className="flex items-center justify-center gap-2">
                        <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                            {order.code}
                        </code>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const url = window.location.href
                                navigator.clipboard.writeText(url)
                                alert('คัดลอก URL แล้ว!')
                            }}
                        >
                            <Copy className="h-4 w-4 mr-1" />
                            แชร์
                        </Button>
                    </div>
                    <p className="text-muted-foreground mt-2">
                        {order.round.shop.name} • {order.round.name}
                    </p>
                </div>

                {/* Status Steps */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
                            <div
                                className="absolute top-5 left-0 h-0.5 bg-primary transition-all"
                                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                            />

                            {statusSteps.map((step, index) => {
                                const Icon = step.icon
                                const isActive = index <= currentStepIndex
                                const isCurrent = index === currentStepIndex

                                return (
                                    <div key={step.key} className="flex flex-col items-center z-10">
                                        <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                      ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className={`text-xs mt-2 ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Section - Show only if PENDING */}
                {order.status === 'PENDING' && bankInfo && (
                    <Card className="mb-6 border-primary">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <CreditCard className="h-5 w-5" />
                                ชำระเงิน
                            </CardTitle>
                            <CardDescription>
                                กรุณาโอนเงินและแนบสลิปเพื่อยืนยันการสั่งซื้อ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {/* Bank Info */}
                            <div className="bg-muted p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">ธนาคาร</span>
                                    <span className="font-medium">{bankInfo.bankName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">เลขบัญชี</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-lg">{bankInfo.accNo}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => copyToClipboard(bankInfo.accNo)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">ชื่อบัญชี</span>
                                    <span className="font-medium">{bankInfo.accName}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-medium">ยอดโอน</span>
                                    <span className="font-bold text-primary">
                                        ฿{order.grandTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Slip Upload */}
                            <div className="border-2 border-dashed rounded-lg p-4">
                                {slipPreview ? (
                                    <div className="space-y-3">
                                        <img
                                            src={slipPreview}
                                            alt="Slip"
                                            className="max-h-64 mx-auto rounded"
                                        />
                                        {order.status === 'PENDING' && (
                                            <label className="block">
                                                <Button variant="outline" className="w-full" disabled={uploading}>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {uploading ? 'กำลังอัพโหลด...' : 'เปลี่ยนสลิป'}
                                                </Button>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleSlipUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                ) : (
                                    <label className="block cursor-pointer">
                                        <div className="text-center py-8">
                                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                            <p className="font-medium">คลิกเพื่ออัพโหลดสลิป</p>
                                            <p className="text-sm text-muted-foreground">รองรับ JPG, PNG</p>
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleSlipUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Waiting for confirmation */}
                {order.status === 'PAID_WAITING' && (
                    <Card className="mb-6 border-yellow-500">
                        <CardContent className="py-8 text-center">
                            <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
                            <h3 className="font-semibold text-lg">รอร้านค้ายืนยัน</h3>
                            <p className="text-muted-foreground">
                                เราได้รับสลิปโอนเงินแล้ว กำลังตรวจสอบ...
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Tracking Code */}
                {order.trackingCode && (
                    <Card className="mb-6">
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">เลขพัสดุ</p>
                                    <code className="text-lg font-mono font-bold">{order.trackingCode}</code>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(order.trackingCode!)}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    คัดลอก
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            ฿{item.price.toLocaleString()} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-medium">
                                        ฿{item.totalPrice.toLocaleString()}
                                    </p>
                                </div>
                            ))}

                            <Separator />

                            <div className="flex justify-between text-sm">
                                <span>ค่าสินค้า</span>
                                <span>฿{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>ค่าจัดส่ง</span>
                                <span>฿{order.shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>รวมทั้งหมด</span>
                                <span>฿{order.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        สร้างเมื่อ {new Date(order.createdAt).toLocaleString('th-TH')}
                    </p>
                    <Link href="/">
                        <Button variant="link">กลับหน้าร้านค้า</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
