'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // ตรวจสอบ credentials และ email verification ก่อน
            const checkRes = await fetch('/api/auth/check-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const checkData = await checkRes.json()

            // ถ้ายังไม่ verify email
            if (checkData.status === 'email_not_verified') {
                router.push(`/verification-pending?email=${encodeURIComponent(email)}`)
                return
            }

            // ถ้า credentials ผิด
            if (checkData.status === 'invalid_credentials') {
                setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
                setLoading(false)
                return
            }

            // ถ้าผ่านการตรวจสอบแล้ว ทำ signIn จริง
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
            } else {
                router.push('/admin')
                router.refresh()
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <a href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">24</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            PreOrder24
                        </span>
                    </a>
                    <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
                    <CardDescription>
                        เข้าสู่ระบบเพื่อจัดการร้านค้า
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="text-right">
                            <a href="/forgot-password" className="text-sm text-violet-600 hover:underline">
                                ลืมรหัสผ่าน?
                            </a>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            เข้าสู่ระบบ
                        </Button>

                        <div className="text-center text-sm text-muted-foreground mt-4">
                            ยังไม่มีบัญชี?{' '}
                            <a href="/register" className="text-violet-600 hover:underline font-medium">
                                สมัครสมาชิกฟรี
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
