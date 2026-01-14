'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Upload, Plus, Loader2, Image as ImageIcon } from 'lucide-react'

interface Shop {
    id: string
    name: string
}

interface ProductFormProps {
    initialData?: {
        name: string
        description?: string | null
        price: number
        costPrice?: number | null
        images: string[]
        shopId: string
        isAvailable: boolean
        limitPerRound?: number | null
    }
    shops: Shop[]
    onSubmit: (data: any) => Promise<void>
    title: string
}

export function ProductForm({ initialData, shops, onSubmit, title }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        costPrice: initialData?.costPrice || '',
        images: initialData?.images || [],
        shopId: initialData?.shopId || (shops.length > 0 ? shops[0].id : ''),
        isAvailable: initialData?.isAvailable ?? true,
        limitPerRound: initialData?.limitPerRound || '',
    })

    // Sync formData when initialData changes (important for shop pre-selection)
    useEffect(() => {
        if (initialData?.shopId && initialData.shopId !== formData.shopId) {
            setFormData(prev => ({
                ...prev,
                shopId: initialData.shopId
            }))
        }
    }, [initialData?.shopId])

    const [imageUrlInput, setImageUrlInput] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isAvailable: checked }))
    }

    const handleShopChange = (value: string) => {
        setFormData(prev => ({ ...prev, shopId: value }))
    }

    const _addImage = (url: string) => { // Removed handleAddImageUrl as it was clashing with variable name
        if (url) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, url]
            }))
            setImageUrlInput('')
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const data = new FormData()
            data.append('file', file)

            const res = await fetch('/api/admin/uploads', {
                method: 'POST',
                body: data
            })

            if (res.ok) {
                const result = await res.json()
                _addImage(result.url)
            } else {
                alert('Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Upload error')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit({
                ...formData,
                price: parseFloat(formData.price.toString()),
                costPrice: formData.costPrice ? parseFloat(formData.costPrice.toString()) : null,
                limitPerRound: formData.limitPerRound ? parseInt(formData.limitPerRound.toString()) : null
            })
            router.refresh()
            router.push('/admin/products')
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
                        <Label htmlFor="name">ชื่อสินค้า <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="shopId">ร้านค้า <span className="text-red-500">*</span></Label>
                        <Select value={formData.shopId} onValueChange={handleShopChange}>
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

                    <div className="grid gap-2">
                        <Label htmlFor="price">ราคาขาย (บาท) <span className="text-red-500">*</span></Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="costPrice">ต้นทุน (บาท)</Label>
                        <p className="text-sm text-muted-foreground">สำหรับคำนวณกำไร (ไม่บังคับ)</p>
                        <Input
                            id="costPrice"
                            name="costPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="เช่น 50"
                            value={formData.costPrice}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">รายละเอียด</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>รูปภาพสินค้า</Label>

                        {/* Image Preview Grid */}
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {formData.images.map((url, index) => (
                                    <div key={index} className="relative aspect-square border rounded overflow-hidden group">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Input
                                placeholder="วาง URL รูปภาพ..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        _addImage(imageUrlInput)
                                    }
                                }}
                            />
                            <Button type="button" variant="secondary" onClick={() => _addImage(imageUrlInput)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 my-2">
                            <span className="text-sm text-muted-foreground">- หรือ -</span>
                        </div>

                        <label className="block">
                            <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                                <span>
                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    อัพโหลดรูปภาพ
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </span>
                            </Button>
                        </label>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="space-y-0.5">
                            <Label>สถานะการขาย</Label>
                            <p className="text-sm text-muted-foreground">เปิด/ปิดการขายสินค้านี้</p>
                        </div>
                        <Switch
                            checked={formData.isAvailable}
                            onCheckedChange={handleSwitchChange}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="limitPerRound">จำกัดจำนวนต่อรอบ (ชิ้น)</Label>
                            <p className="text-sm text-muted-foreground mb-2">เว้นว่างไว้หากไม่ต้องการจำกัด</p>
                            <Input
                                id="limitPerRound"
                                name="limitPerRound"
                                type="number"
                                min="1"
                                placeholder="เช่น 20"
                                value={formData.limitPerRound}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
