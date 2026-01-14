import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminMobileNav } from '@/components/admin-mobile-nav'
import { prisma } from '@/lib/prisma'

async function getUserShops(email: string) {
    return await prisma.shop.findMany({
        where: { owner: { email } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Redirect to login if not authenticated
    if (!session) {
        redirect('/login')
    }

    // Fetch shops on server side
    const shops = session.user?.email
        ? await getUserShops(session.user.email)
        : []

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r hidden md:block fixed index-0 h-screen">
                <AdminSidebar user={session.user} shops={shops} className="border-none" />
            </aside>

            {/* Mobile Header and Navigation */}
            <AdminMobileNav user={session.user} shops={shops} />

            {/* Main Content */}
            <main className="flex-1 bg-background md:pl-64 pt-14 md:pt-0">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
