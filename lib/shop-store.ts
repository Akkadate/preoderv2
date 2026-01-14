'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Shop {
    id: string
    name: string
    slug?: string
    type?: string
}

interface ShopStore {
    selectedShopId: string | null  // null = "ทุกร้าน"
    shops: Shop[]
    setSelectedShopId: (id: string | null) => void
    setShops: (shops: Shop[]) => void
    getSelectedShopIds: () => string[]
}

export const useShopStore = create<ShopStore>()(
    persist(
        (set, get) => ({
            selectedShopId: null,
            shops: [],
            setSelectedShopId: (id) => set({ selectedShopId: id }),
            setShops: (shops) => set({ shops }),
            getSelectedShopIds: () => {
                const { selectedShopId, shops } = get()
                if (selectedShopId === null) {
                    return shops.map(s => s.id)
                }
                return [selectedShopId]
            }
        }),
        {
            name: 'shop-store',
        }
    )
)
