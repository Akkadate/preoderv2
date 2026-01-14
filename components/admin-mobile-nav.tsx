'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface Shop {
    id: string
    name: string
}

interface AdminMobileNavProps {
    user?: {
        name?: string | null
        email?: string | null
    }
    shops?: Shop[]
}

export function AdminMobileNav({ user, shops = [] }: AdminMobileNavProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-14 flex items-center px-4">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                    <AdminSidebar
                        user={user}
                        shops={shops}
                        className="border-none"
                        onNavigate={() => setOpen(false)}
                    />
                </SheetContent>
            </Sheet>
            <span className="font-bold ml-2">Admin Panel</span>
        </div>
    )
}
