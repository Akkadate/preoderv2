'use client'

import { usePathname } from 'next/navigation'
import CartDrawer from '@/components/cart-drawer'

export function CartController() {
    const pathname = usePathname()
    // Don't show cart on admin pages
    const isAdmin = pathname?.startsWith('/admin')

    // Don't show cart on receipt pages either
    const isReceipt = pathname?.startsWith('/receipt')

    if (isAdmin || isReceipt) return null

    return <CartDrawer />
}
