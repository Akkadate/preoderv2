'use client'

import { usePathname } from 'next/navigation'
import CartDrawer from '@/components/cart-drawer'

export function CartController() {
    const pathname = usePathname()
    // Don't show cart on admin pages
    const isAdmin = pathname?.startsWith('/admin')

    // Don't show cart on receipt or print pages either
    const isReceipt = pathname?.startsWith('/receipt')
    const isPrint = pathname?.startsWith('/print')

    if (isAdmin || isReceipt || isPrint) return null

    return <CartDrawer />
}
