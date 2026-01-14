'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { PromptPayQR } from '@/components/PromptPayQR'
import dynamic from 'next/dynamic'

// Dynamic import for LocationPicker (Leaflet requires window)
const LocationPicker = dynamic(
    () => import('@/components/LocationPicker').then(mod => ({ default: mod.LocationPicker })),
    { ssr: false, loading: () => <div className="h-48 bg-muted rounded-lg animate-pulse" /> }
)

interface CustomerInfo {
    name: string
    phone: string
    address: string
    lineId: string
    note: string
    location: { lat: number; lng: number } | null
}

interface ShopSettings {
    bankInfo?: {
        bankName: string
        accountNumber: string
        accountName: string
        promptPayNumber: string
    }
    shippingRates?: {
        mode: 'PER_PIECE' | 'PER_ORDER'
        perPieceRate: number
        perOrderRate: number
    }
}

export default function CheckoutPage() {
    const router = useRouter()
    const { items, getTotalPrice, clearCart, shopId, roundId } = useCartStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null)
    const [loadingSettings, setLoadingSettings] = useState(true)
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        phone: '',
        address: '',
        lineId: '',
        note: '',
        location: null,
    })

    // Load saved customer info from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedCustomerInfo')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setCustomerInfo(prev => ({
                    ...prev,
                    name: parsed.name || '',
                    phone: parsed.phone || '',
                    address: parsed.address || '',
                    lineId: parsed.lineId || '',
                    location: parsed.location || null,
                    // Note is intentionally not restored
                }))
            } catch (e) {
                console.error('Failed to parse saved customer info', e)
            }
        }
    }, [])

    // Fetch shop settings on mount
    useEffect(() => {
        async function fetchSettings() {
            if (!shopId) {
                setLoadingSettings(false)
                return
            }
            try {
                const res = await fetch(`/api/shops/${shopId}/settings`)
                if (res.ok) {
                    const data = await res.json()
                    setShopSettings(data)
                }
            } catch (error) {
                console.error('Failed to fetch shop settings:', error)
            } finally {
                setLoadingSettings(false)
            }
        }
        fetchSettings()
    }, [shopId])

    const totalPrice = getTotalPrice() || 0
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    // Calculate shipping based on shop settings
    const calculateShipping = (): number => {
        if (!shopSettings?.shippingRates) {
            return 50 // Default fallback
        }

        const rates = shopSettings.shippingRates as any

        // Handle NEW format: { mode: 'PER_PIECE' | 'PER_ORDER', perPieceRate, perOrderRate }
        if (rates.mode === 'PER_PIECE') {
            return totalItems * (rates.perPieceRate || 0)
        } else if (rates.mode === 'PER_ORDER') {
            return rates.perOrderRate || 0
        }

        // Handle LEGACY format: { type: 'distance', basePrice, perKm, freeShippingOver }
        if (rates.type === 'distance' || rates.basePrice !== undefined) {
            const basePrice = rates.basePrice || 0
            const freeShippingOver = rates.freeShippingOver || 0

            // If order exceeds free shipping threshold
            if (freeShippingOver > 0 && totalPrice >= freeShippingOver) {
                return 0
            }
            return basePrice
        }

        return 50 // Fallback if no recognized format
    }

    const shippingCost = calculateShipping() || 0
    const grandTotal = (totalPrice || 0) + (shippingCost || 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customerInfo,
                    shopId,
                    roundId,
                    shippingCost,
                }),
            })

            if (!response.ok) {
                throw new Error('Checkout failed')
            }

            const order = await response.json()

            // Save customer info to localStorage for next time
            localStorage.setItem('savedCustomerInfo', JSON.stringify({
                name: customerInfo.name,
                phone: customerInfo.phone,
                address: customerInfo.address,
                lineId: customerInfo.lineId,
                location: customerInfo.location,
            }))

            clearCart()
            router.push(`/checkout/success?orderId=${order.id}`)
        } catch (error) {
            console.error('Checkout error:', error)
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">ตะกร้าว่างเปล่า</h1>
                    <p className="text-muted-foreground mb-4">
                        กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ
                    </p>
                    <Link href="/">
                        <Button>กลับหน้าหลัก</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8 pb-20">
            <div className="container max-w-4xl mx-auto px-6 sm:px-8">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    กลับหน้าร้านค้า
                </Link>

                <h1 className="text-3xl font-bold mb-8">ชำระเงิน</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Customer Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">ชื่อ-นามสกุล *</label>
                                        <Input
                                            required
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                            placeholder="กรุณากรอกชื่อ"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">เบอร์โทรศัพท์ *</label>
                                        <Input
                                            required
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                            placeholder="08X-XXX-XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">LINE ID</label>
                                        <Input
                                            value={customerInfo.lineId}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, lineId: e.target.value })}
                                            placeholder="@line_id"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">ที่อยู่จัดส่ง *</label>
                                        <Input
                                            required
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                            placeholder="กรอกที่อยู่สำหรับจัดส่ง"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">ตำแหน่งบนแผนที่</label>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            กดปุ่มใช้ตำแหน่งปัจจุบัน หรือคลิกบนแผนที่เพื่อปักหมุด
                                        </p>
                                        <LocationPicker
                                            value={customerInfo.location}
                                            onChange={(location) => setCustomerInfo({ ...customerInfo, location })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">หมายเหตุ</label>
                                        <Input
                                            value={customerInfo.note}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                                            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                                        />
                                    </div>
                                </CardContent>
                            </Card>


                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div key={item.productId} className="flex justify-between">
                                                <div>
                                                    <p className="font-medium">{item.productName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ฿{item.price.toLocaleString()} × {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-medium">
                                                    ฿{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}

                                        <Separator />

                                        <div className="flex justify-between text-sm">
                                            <span>ค่าสินค้า ({totalItems} ชิ้น)</span>
                                            <span>฿{totalPrice.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span>
                                                ค่าจัดส่ง
                                                {shopSettings?.shippingRates?.mode === 'PER_PIECE' && (
                                                    <span className="text-muted-foreground text-xs ml-1">
                                                        (฿{shopSettings.shippingRates.perPieceRate}/ชิ้น)
                                                    </span>
                                                )}
                                            </span>
                                            <span>฿{shippingCost.toLocaleString()}</span>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between text-lg font-bold">
                                            <span>รวมทั้งหมด</span>
                                            <span>฿{grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        size="lg"
                                        disabled={isSubmitting || loadingSettings}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                กำลังสร้างคำสั่งซื้อ...
                                            </>
                                        ) : (
                                            'ยืนยันคำสั่งซื้อ'
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground mt-4">
                                        หลังยืนยัน กรุณาโอนเงินและแนบสลิป
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
