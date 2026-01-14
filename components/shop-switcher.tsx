'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Store, Building2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useShopStore } from '@/lib/shop-store'

interface Shop {
    id: string
    name: string
}

interface ShopSwitcherProps {
    shops: Shop[]
}

export function ShopSwitcher({ shops }: ShopSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { selectedShopId, setSelectedShopId, setShops } = useShopStore()

    // Initialize shops in store
    useEffect(() => {
        setShops(shops)
    }, [shops, setShops])

    // Sync with cookie on mount
    useEffect(() => {
        const cookieShopId = document.cookie
            .split('; ')
            .find(row => row.startsWith('selectedShopId='))
            ?.split('=')[1]

        if (cookieShopId && cookieShopId !== selectedShopId) {
            setSelectedShopId(cookieShopId === 'all' ? null : cookieShopId)
        }
    }, [selectedShopId, setSelectedShopId])

    const handleChange = (value: string) => {
        const newShopId = value === 'all' ? null : value
        setSelectedShopId(newShopId)

        // Set cookie for Server Components to read
        document.cookie = `selectedShopId=${value}; path=/; max-age=31536000`

        // Force full page reload to re-read cookies on server
        window.location.reload()
    }

    const selectedShop = shops.find(s => s.id === selectedShopId)

    return (
        <div className="px-4 py-3 border-b">
            <label className="text-xs text-muted-foreground mb-1 block">
                ร้านปัจจุบัน
            </label>
            <Select
                value={selectedShopId || 'all'}
                onValueChange={handleChange}
            >
                <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <SelectValue>
                            {selectedShopId === null ? 'ทุกร้าน' : selectedShop?.name || 'เลือกร้าน'}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            ทุกร้าน ({shops.length})
                        </div>
                    </SelectItem>
                    {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                            <div className="flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                {shop.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

