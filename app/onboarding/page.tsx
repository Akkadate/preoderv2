'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Store, Utensils, ShoppingBag, Check } from 'lucide-react'

const shopTypes = [
    {
        value: 'BUYING_AGENT',
        label: 'ร้านรับหิ้ว',
        description: 'สินค้าจากต่างประเทศ, รอบขายยาว',
        icon: ShoppingBag,
    },
    {
        value: 'KITCHEN',
        label: 'ร้านอาหาร / ขนม',
        description: 'เมนูรายวัน, เบเกอรี่',
        icon: Utensils,
    },
]

export default function OnboardingPage() {
    const router = useRouter()
    const { data: session, status } = useSession()

    const [step, setStep] = useState(1)
    const [shopName, setShopName] = useState('')
    const [slug, setSlug] = useState('')
    const [shopType, setShopType] = useState('BUYING_AGENT')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
    const [checkingSlug, setCheckingSlug] = useState(false)

    // Redirect if not logged in
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    // Auto-generate slug from shop name
    useEffect(() => {
        if (shopName && !slug) {
            const generatedSlug = shopName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 50)
            setSlug(generatedSlug)
        }
    }, [shopName, slug])

    // Check slug availability
    useEffect(() => {
        if (!slug || slug.length < 3) {
            setSlugAvailable(null)
            return
        }

        const timer = setTimeout(async () => {
            setCheckingSlug(true)
            try {
                const res = await fetch(`/api/shop/check-slug?slug=${encodeURIComponent(slug)}`)
                const data = await res.json()
                setSlugAvailable(data.available)
            } catch {
                setSlugAvailable(null)
            } finally {
                setCheckingSlug(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [slug])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!shopName.trim()) {
            setError('กรุณากรอกชื่อร้าน')
            return
        }

        if (slug.length < 3) {
            setError('URL ร้านต้องมีอย่างน้อย 3 ตัวอักษร')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/shop/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: shopName,
                    slug,
                    type: shopType,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด')
                setLoading(false)
                return
            }

            // Success! Redirect to admin
            router.push('/admin')
            router.refresh()
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50 p-4">
            {/* Background Decoration */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />

            <Card className="w-full max-w-lg relative z-10 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                        <Store className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">สร้างร้านค้าของคุณ</CardTitle>
                    <CardDescription>
                        ตั้งค่าร้านเพื่อเริ่มรับออเดอร์
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Shop Type */}
                        <div className="space-y-3">
                            <Label>ประเภทร้าน</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {shopTypes.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = shopType === type.value
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setShopType(type.value)}
                                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                                    ? 'border-violet-600 bg-violet-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-violet-600' : 'text-gray-400'}`} />
                                            <div className={`font-medium ${isSelected ? 'text-violet-600' : 'text-gray-900'}`}>
                                                {type.label}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {type.description}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Step 2: Shop Name */}
                        <div className="space-y-2">
                            <Label htmlFor="shopName">ชื่อร้าน *</Label>
                            <Input
                                id="shopName"
                                type="text"
                                placeholder="เช่น ขนมอร่อย หรือ Japan Preorder"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                required
                                disabled={loading}
                                className="text-lg"
                            />
                        </div>

                        {/* Step 3: Shop URL */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL ร้าน *</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    preorder24.com/shop/
                                </span>
                                <div className="relative flex-1">
                                    <Input
                                        id="slug"
                                        type="text"
                                        placeholder="your-shop"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        required
                                        disabled={loading}
                                        className={`pr-10 ${slugAvailable === true ? 'border-green-500' :
                                                slugAvailable === false ? 'border-red-500' : ''
                                            }`}
                                    />
                                    {checkingSlug && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                    )}
                                    {!checkingSlug && slugAvailable === true && (
                                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                    )}
                                </div>
                            </div>
                            {slugAvailable === false && (
                                <p className="text-xs text-red-500">URL นี้ถูกใช้งานแล้ว</p>
                            )}
                            {slugAvailable === true && (
                                <p className="text-xs text-green-600">URL นี้ว่างอยู่</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                ใช้ภาษาอังกฤษตัวเล็ก ตัวเลข และขีด (-) เท่านั้น
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 py-6 text-lg"
                            disabled={loading || slugAvailable === false}
                        >
                            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            สร้างร้านค้า
                        </Button>

                        {/* Free Plan Note */}
                        <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-lg text-center">
                            <span className="font-medium">🎉 เริ่มต้นฟรี!</span>
                            <br />
                            <span className="text-xs text-emerald-600">
                                รับ 10 รอบขาย / 50 ออเดอร์ต่อเดือน ไม่มีค่าใช้จ่าย
                            </span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
