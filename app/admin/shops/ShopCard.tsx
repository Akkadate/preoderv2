'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Settings, ExternalLink, Copy, CheckCircle } from 'lucide-react'

interface ShopCardProps {
    shop: {
        id: string
        name: string
        slug: string
        logo: string | null
        isActive: boolean
        _count: {
            products: number
            rounds: number
        }
    }
}

export function ShopCard({ shop }: ShopCardProps) {
    const router = useRouter()
    const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false })

    const handleEditClick = () => {
        // Set cookie to select this shop
        document.cookie = `selectedShopId=${shop.id}; path=/; max-age=31536000`
        router.push('/admin/settings')
    }

    const showToast = (message: string) => {
        setToast({ message, visible: true })
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
    }

    const copyUrl = (e: React.MouseEvent) => {
        e.stopPropagation()
        const url = `${window.location.origin}/shop/${shop.slug}`
        navigator.clipboard.writeText(url)
        showToast('คัดลอกลิงก์ร้านค้าเรียบร้อย')
    }

    return (
        <>
            <Card className="hover:border-primary transition-colors">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {shop.logo ? (
                                <img
                                    src={shop.logo}
                                    alt={shop.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                    <Store className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-lg">{shop.name}</CardTitle>
                                <div className="flex items-center gap-1">
                                    <p className="text-sm text-muted-foreground">/{shop.slug}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                        onClick={copyUrl}
                                        title="คัดลอกลิงก์ร้านค้า"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Badge variant={shop.isActive ? 'default' : 'secondary'}>
                            {shop.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div>
                            <p className="text-2xl font-bold">{shop._count.products}</p>
                            <p className="text-xs text-muted-foreground">สินค้า</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{shop._count.rounds}</p>
                            <p className="text-xs text-muted-foreground">รอบ</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            size="sm"
                            onClick={handleEditClick}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            แก้ไข
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            size="sm"
                            onClick={() => window.open(`/shop/${shop.slug}`, '_blank')}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            ดูหน้าร้าน
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Toast Notification */}
            {toast.visible && (
                <div className="fixed top-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {toast.message}
                    </div>
                </div>
            )}
        </>
    )
}
