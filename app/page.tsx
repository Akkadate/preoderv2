import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Merchant SaaS Platform</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          ระบบจัดการสำหรับ Pre-order และ Daily Menu
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/shop/japan-preorder">
            <Button size="lg" className="w-full sm:w-auto">
              🇯🇵 Japan Pre-order
            </Button>
          </Link>

          <Link href="/shop/mom-cooking">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              🍛 Mom Cooking
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">🛒 Pre-order Mode</h3>
            <p className="text-sm text-muted-foreground">
              สำหรับรับหิ้วสินค้า รอบยาว 5-7 วัน คำนวณค่าส่งตามน้ำหนัก
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">🍳 Kitchen Mode</h3>
            <p className="text-sm text-muted-foreground">
              สำหรับครัว/ร้านอาหาร เมนูรายวัน คำนวณค่าส่งตามระยะทาง
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
