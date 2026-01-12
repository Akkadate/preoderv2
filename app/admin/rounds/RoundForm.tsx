'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Shop {
    id: string
    name: string
}

interface RoundFormProps {
    initialData?: {
        id?: string
        name: string
        shopId: string
        opensAt: string
        closesAt: string
        shippingStart?: string | null
        pickupDate?: string | null
        status: string
    }
    shops: Shop[]
    onSubmit: (data: any) => Promise<void>
    title: string
}

// Helper to format date for datetime-local input
function formatDateTimeLocal(date: string | Date | null | undefined): string {
    if (!date) return ''
    const d = new Date(date)
    // Adjust for timezone
    const offset = d.getTimezoneOffset() * 60000
    const localDate = new Date(d.getTime() - offset)
    return localDate.toISOString().slice(0, 16)
}

export function RoundForm({ initialData, shops, onSubmit, title }: RoundFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        shopId: initialData?.shopId || (shops.length > 0 ? shops[0].id : ''),
        opensAt: formatDateTimeLocal(initialData?.opensAt) || '',
        closesAt: formatDateTimeLocal(initialData?.closesAt) || '',
        shippingStart: formatDateTimeLocal(initialData?.shippingStart) || '',
        pickupDate: formatDateTimeLocal(initialData?.pickupDate) || '',
        status: initialData?.status || 'OPEN',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required dates
        if (!formData.opensAt || !formData.closesAt) {
            alert('กรุณากรอกวันเปิดรับและวันปิดรับ')
            return
        }

        setLoading(true)
        try {
            // Safe date conversion
            const safeToISO = (dateStr: string) => {
                if (!dateStr) return null
                const d = new Date(dateStr)
                if (isNaN(d.getTime())) return null
                return d.toISOString()
            }

            await onSubmit({
                ...formData,
                opensAt: safeToISO(formData.opensAt),
                closesAt: safeToISO(formData.closesAt),
                shippingStart: safeToISO(formData.shippingStart),
                pickupDate: safeToISO(formData.pickupDate),
            })
            router.refresh()
            router.push('/admin/rounds')
        } catch (error) {
            console.error('Submit error:', error)
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        บันทึก
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">ชื่อรอบ <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="เช่น รอบบินญี่ปุ่น ม.ค. 2026"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="shopId">ร้านค้า <span className="text-red-500">*</span></Label>
                        <Select value={formData.shopId} onValueChange={(v) => handleSelectChange('shopId', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกร้านค้า" />
                            </SelectTrigger>
                            <SelectContent>
                                {shops.map(shop => (
                                    <SelectItem key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="opensAt">วันเวลาเปิดรับ <span className="text-red-500">*</span></Label>
                            <Input
                                id="opensAt"
                                name="opensAt"
                                type="datetime-local"
                                value={formData.opensAt}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="closesAt">วันเวลาปิดรับ (Deadline) <span className="text-red-500">*</span></Label>
                            <Input
                                id="closesAt"
                                name="closesAt"
                                type="datetime-local"
                                value={formData.closesAt}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shippingStart">วันเริ่มจัดส่ง</Label>
                            <Input
                                id="shippingStart"
                                name="shippingStart"
                                type="datetime-local"
                                value={formData.shippingStart}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pickupDate">วันรับสินค้า</Label>
                            <Input
                                id="pickupDate"
                                name="pickupDate"
                                type="datetime-local"
                                value={formData.pickupDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 pt-4 border-t">
                        <Label>สถานะรอบ</Label>
                        <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OPEN">🟢 เปิดรับออเดอร์</SelectItem>
                                <SelectItem value="CLOSED">🔴 ปิดรับออเดอร์</SelectItem>
                                <SelectItem value="FULFILLED">✅ จัดส่งครบแล้ว</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
