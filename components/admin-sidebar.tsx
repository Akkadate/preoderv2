'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Package, ShoppingBag, Users, Settings, LayoutDashboard } from 'lucide-react'
import { LogoutButton } from '@/app/admin/LogoutButton'
import { cn } from '@/lib/utils'
import { ShopSwitcher } from '@/components/shop-switcher'

interface Shop {
    id: string
    name: string
}

interface AdminSidebarProps {
    className?: string
    user?: {
        name?: string | null
        email?: string | null
    }
    shops?: Shop[]
    onNavigate?: () => void
}

export function AdminSidebar({ className, user, shops = [], onNavigate }: AdminSidebarProps) {
    return (
        <div className={cn("flex flex-col h-full bg-card border-r", className)}>
            <div className="p-6">
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">{user?.name || 'Admin'}</p>
            </div>

            {/* Shop Switcher */}
            {shops.length > 1 && <ShopSwitcher shops={shops} />}

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
                <Link href="/admin" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>

                <Link href="/admin/rounds" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4" />
                        รอบการขาย
                    </Button>
                </Link>

                <Link href="/admin/products" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4" />
                        สินค้า
                    </Button>
                </Link>

                <Link href="/admin/orders" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        คำสั่งซื้อ
                    </Button>
                </Link>

                <Link href="/admin/customers" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        ลูกค้า
                    </Button>
                </Link>

                <div className="border-t my-2" />

                <Link href="/admin/shops" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <Home className="mr-2 h-4 w-4" />
                        ร้านค้าของฉัน
                    </Button>
                </Link>

                <Link href="/admin/settings" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        ตั้งค่าร้าน
                    </Button>
                </Link>
            </nav>

            <div className="p-4 mt-auto space-y-2 border-t">
                <Link href="/" onClick={onNavigate}>
                    <Button variant="outline" size="sm" className="w-full">
                        <Home className="mr-2 h-4 w-4" />
                        ดูหน้าร้าน
                    </Button>
                </Link>
                <div onClick={onNavigate}>
                    {/* Pass className to LogoutButton if needed, or wrap it */}
                    <LogoutButton />
                </div>
            </div>
        </div>
    )
}
