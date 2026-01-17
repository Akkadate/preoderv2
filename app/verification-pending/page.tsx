'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function VerificationPendingPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || 'your email'
    const [resending, setResending] = useState(false)
    const [resendMessage, setResendMessage] = useState('')

    const handleResend = async () => {
        setResending(true)
        setResendMessage('')

        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (res.ok) {
                setResendMessage('ส่งอีเมลใหม่แล้ว กรุณาตรวจสอบ inbox')
            } else {
                setResendMessage(data.error || 'ไม่สามารถส่งอีเมลได้')
            }
        } catch (error) {
            setResendMessage('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50 p-4">
            {/* Background Decoration */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />

            <Card className="w-full max-w-md relative z-10 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-violet-600" />
                    </div>
                    <CardTitle className="text-2xl">ตรวจสอบอีเมลของคุณ</CardTitle>
                    <CardDescription>
                        เราได้ส่งลิงก์ยืนยันไปที่
                    </CardDescription>
                    <p className="font-medium text-violet-600 mt-2">{email}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-amber-50 text-amber-700 text-sm p-4 rounded-lg">
                        <p className="font-medium mb-1">📬 ไม่เห็นอีเมล?</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                            <li>ตรวจสอบโฟลเดอร์ Spam หรือ Junk</li>
                            <li>รอสักครู่ อาจใช้เวลา 1-2 นาที</li>
                            <li>ตรวจสอบว่าอีเมลถูกต้อง</li>
                        </ul>
                    </div>

                    {resendMessage && (
                        <div className={`text-sm p-3 rounded-lg ${resendMessage.includes('สำเร็จ') || resendMessage.includes('แล้ว')
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                            {resendMessage}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                กำลังส่ง...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                ส่งอีเมลยืนยันอีกครั้ง
                            </>
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        <Link href="/login" className="text-violet-600 hover:underline">
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
