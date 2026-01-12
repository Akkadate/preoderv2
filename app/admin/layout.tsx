import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminMobileNav } from '@/components/admin-mobile-nav'

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

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r hidden md:block fixed index-0 h-screen">
                <AdminSidebar user={session.user} className="border-none" />
            </aside>

            {/* Mobile Header and Navigation */}
            <AdminMobileNav user={session.user} />

            {/* Main Content */}
            <main className="flex-1 bg-background md:pl-64 pt-14 md:pt-0">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
