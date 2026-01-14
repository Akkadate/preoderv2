'use client'

import { useEffect, useState } from 'react'
import { ProductForm } from '../ProductForm'
import { useShopStore } from '@/lib/shop-store'

export function NewProductClient({ shops }: { shops: any[] }) {
    const { selectedShopId } = useShopStore()
    const [initialShopId, setInitialShopId] = useState<string | null>(null)

    // Get the selected shop from store or cookie
    useEffect(() => {
        // Read from cookie if store is not set
        const cookieShopId = document.cookie
            .split('; ')
            .find(row => row.startsWith('selectedShopId='))
            ?.split('=')[1]

        if (selectedShopId) {
            setInitialShopId(selectedShopId)
        } else if (cookieShopId && cookieShopId !== 'all') {
            setInitialShopId(cookieShopId)
        } else if (shops.length > 0) {
            setInitialShopId(shops[0].id)
        }
    }, [selectedShopId, shops])

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            throw new Error('Failed to create product')
        }
    }

    // Wait for initial shop to be determined
    if (initialShopId === null && shops.length > 0) {
        return null // or loading spinner
    }

    return (
        <ProductForm
            shops={shops}
            onSubmit={handleSubmit}
            title="เพิ่มสินค้าใหม่"
            initialData={{
                name: '',
                description: '',
                price: 0,
                costPrice: null,
                images: [],
                shopId: initialShopId || shops[0]?.id || '',
                isAvailable: true,
                limitPerRound: null,
            }}
        />
    )
}
