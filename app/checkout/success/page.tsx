'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Copy } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    const copyOrderId = () => {
        if (orderId) {
            navigator.clipboard.writeText(orderId)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-8">
            <Card className="max-w-md w-full mx-4">
                <CardHeader className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl">สร้างคำสั่งซื้อสำเร็จ!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        ขอบคุณสำหรับคำสั่งซื้อ กรุณาโอนเงินและแนบสลิป
                    </p>

                    {orderId && (
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">รหัสคำสั่งซื้อ</p>
                            <div className="flex items-center justify-center gap-2">
                                <code className="text-lg font-mono font-bold">{orderId.slice(0, 12)}...</code>
                                <Button variant="ghost" size="icon" onClick={copyOrderId}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg text-left">
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            ขั้นตอนถัดไป
                        </h3>
                        <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                            <li>โอนเงินตามยอดที่แจ้ง</li>
                            <li>แนบสลิปโอนเงิน</li>
                            <li>รอการยืนยันจากร้านค้า</li>
                        </ol>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        {orderId && (
                            <Link href={`/orders/${orderId}`}>
                                <Button className="w-full">
                                    ชำระเงินและแนบสลิป
                                </Button>
                            </Link>
                        )}
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                กลับหน้าหลัก
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p>กำลังโหลด...</p>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
