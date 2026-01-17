'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('ไม่พบ token ยืนยัน')
            return
        }

        async function verifyEmail() {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`)
                const data = await res.json()

                if (res.ok && data.success) {
                    setStatus('success')
                    setMessage('ยืนยันอีเมลสำเร็จ!')
                } else {
                    setStatus('error')
                    setMessage(data.error || 'เกิดข้อผิดพลาด')
                }
            } catch (error) {
                setStatus('error')
                setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่')
            }
        }

        verifyEmail()
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50 p-4">
            {/* Background Decoration */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />

            <Card className="w-full max-w-md relative z-10 shadow-xl">
                <CardHeader className="text-center">
                    {status === 'loading' && (
                        <>
                            <div className="mx-auto w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                                <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
                            </div>
                            <CardTitle className="text-2xl">กำลังยืนยันอีเมล...</CardTitle>
                            <CardDescription>
                                กรุณารอสักครู่
                            </CardDescription>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl text-green-600">ยืนยันอีเมลสำเร็จ!</CardTitle>
                            <CardDescription>
                                คุณสามารถเข้าสู่ระบบได้แล้ว
                            </CardDescription>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl text-red-600">ยืนยันไม่สำเร็จ</CardTitle>
                            <CardDescription>
                                {message}
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent className="text-center">
                    {status === 'success' && (
                        <Link href="/login">
                            <Button
                                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                            >
                                เข้าสู่ระบบ
                            </Button>
                        </Link>
                    )}

                    {status === 'error' && (
                        <div className="space-y-3">
                            <Link href="/register">
                                <Button
                                    className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                                >
                                    สมัครสมาชิกใหม่
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" className="w-full">
                                    เข้าสู่ระบบ
                                </Button>
                            </Link>
                        </div>
                    )}

                    {status === 'loading' && (
                        <p className="text-sm text-muted-foreground">
                            กำลังตรวจสอบข้อมูล...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyEmailContent />
        </Suspense>
    )
}
