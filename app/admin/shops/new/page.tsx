'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewShopPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'BUYING_AGENT' as 'BUYING_AGENT' | 'KITCHEN',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9ก-๙\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setFormData(prev => ({ ...prev, slug }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.slug) {
            alert('กรุณากรอกชื่อร้านและ URL')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to create shop')
            }

            router.push('/admin/shops')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating shop:', error)
            alert(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/shops">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">สร้างร้านใหม่</h1>
                    <p className="text-muted-foreground">เพิ่มร้านค้าใหม่ในบัญชีของคุณ</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลร้านค้า</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">ชื่อร้าน <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="เช่น Mom Cooking, Japan Pre-order"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">URL ร้าน <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">yoursite.com/</span>
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="mom-cooking"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ต้องเป็น a-z, 0-9, - เท่านั้น ไม่เว้นวรรค
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">ประเภทร้าน</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'BUYING_AGENT' | 'KITCHEN') =>
                                    setFormData(prev => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUYING_AGENT">
                                        🛍️ รับหิ้ว (Pre-order สินค้าจากต่างประเทศ)
                                    </SelectItem>
                                    <SelectItem value="KITCHEN">
                                        🍳 ครัว/อาหาร (รอบรายวัน เมนูหมุนเวียน)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">รายละเอียดร้าน</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="อธิบายเกี่ยวกับร้านของคุณ..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Link href="/admin/shops" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                สร้างร้าน
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
