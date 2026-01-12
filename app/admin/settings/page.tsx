'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PromptPayQR } from '@/components/PromptPayQR'
import { Loader2, Save, Building2, Truck, QrCode, CheckCircle2, XCircle, Store } from 'lucide-react'
import { ImageUpload } from '@/components/image-upload'

interface BankInfo {
    bankName: string
    accountNumber: string
    accountName: string
    promptPayNumber: string
    promptPayType: 'PHONE' | 'ID_CARD'
}

interface ShippingRates {
    mode: 'PER_PIECE' | 'PER_ORDER'
    perPieceRate: number
    perOrderRate: number
}

interface ShopSettings {
    id: string
    name: string
    slug: string
    description: string | null
    logo: string | null
    bankInfo: BankInfo | null
    shippingRates: ShippingRates | null
}

interface Toast {
    type: 'success' | 'error'
    message: string
}

const defaultBankInfo: BankInfo = {
    bankName: '',
    accountNumber: '',
    accountName: '',
    promptPayNumber: '',
    promptPayType: 'PHONE'
}

const defaultShippingRates: ShippingRates = {
    mode: 'PER_ORDER',
    perPieceRate: 30,
    perOrderRate: 50
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [shop, setShop] = useState<ShopSettings | null>(null)
    const [bankInfo, setBankInfo] = useState<BankInfo>(defaultBankInfo)
    const [shippingRates, setShippingRates] = useState<ShippingRates>(defaultShippingRates)
    const [telegramBotToken, setTelegramBotToken] = useState('')
    const [telegramChatId, setTelegramChatId] = useState('')
    const [testingTelegram, setTestingTelegram] = useState(false)
    const [toast, setToast] = useState<Toast | null>(null)

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = await res.json()
                setShop(data)
                if (data.bankInfo) {
                    setBankInfo({ ...defaultBankInfo, ...data.bankInfo })
                }
                if (data.shippingRates) {
                    setShippingRates({ ...defaultShippingRates, ...data.shippingRates })
                }
                if (data.telegramBotToken) {
                    setTelegramBotToken(data.telegramBotToken)
                }
                if (data.telegramChatId) {
                    setTelegramChatId(data.telegramChatId)
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: shop?.name,
                    logo: shop?.logo,
                    description: shop?.description,
                    bankInfo,
                    shippingRates,
                    telegramBotToken,
                    telegramChatId
                })
            })

            if (res.ok) {
                setToast({ type: 'success', message: 'บันทึกสำเร็จ!' })
            } else {
                const error = await res.json()
                setToast({ type: 'error', message: error.error || 'เกิดข้อผิดพลาด' })
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
            setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
        } finally {
            setSaving(false)
        }
    }

    const handleTestTelegram = async () => {
        setTestingTelegram(true)
        try {
            const res = await fetch('/api/admin/telegram/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botToken: telegramBotToken,
                    chatId: telegramChatId
                })
            })

            const data = await res.json()

            if (res.ok) {
                setToast({ type: 'success', message: data.message || 'ส่งข้อความทดสอบสำเร็จ!' })
            } else {
                setToast({ type: 'error', message: data.error || 'ส่งข้อความไม่สำเร็จ' })
            }
        } catch (error) {
            console.error('Test telegram error:', error)
            setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
        } finally {
            setTestingTelegram(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all animate-in slide-in-from-top-2 duration-300 ${toast.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5" />
                    ) : (
                        <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">ตั้งค่าร้าน</h1>
                    <p className="text-muted-foreground">{shop?.name}</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    บันทึก
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Shop Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            ข้อมูลร้านค้า
                        </CardTitle>
                        <CardDescription>ชื่อร้านและโลโก้ที่ลูกค้าจะเห็น</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="grid gap-2">
                                <Label>โลโก้ร้าน</Label>
                                <ImageUpload
                                    value={shop?.logo}
                                    onChange={(url) => setShop(prev => prev ? { ...prev, logo: url } : null)}
                                    onRemove={() => setShop(prev => prev ? { ...prev, logo: null } : null)}
                                />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid gap-2">
                                    <Label>ชื่อร้าน</Label>
                                    <Input
                                        value={shop?.name || ''}
                                        onChange={(e) => setShop(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        placeholder="ชื่อร้านของคุณ"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>คำอธิบายร้าน (Optional)</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={shop?.description || ''}
                                        onChange={(e) => setShop(prev => prev ? { ...prev, description: e.target.value } : null)}
                                        placeholder="เช่น ร้านรับหิ้วสินค้าจากญี่ปุ่น ของแท้ 100%"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Bank Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            ข้อมูลธนาคาร
                        </CardTitle>
                        <CardDescription>ข้อมูลบัญชีสำหรับรับชำระเงิน</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>ชื่อธนาคาร</Label>
                            <Input
                                placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                                value={bankInfo.bankName}
                                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>เลขบัญชี</Label>
                            <Input
                                placeholder="123-4-56789-0"
                                value={bankInfo.accountNumber}
                                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>ชื่อบัญชี</Label>
                            <Input
                                placeholder="นาย/นาง/นางสาว ชื่อ นามสกุล"
                                value={bankInfo.accountName}
                                onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                            />
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                เลข PromptPay
                            </Label>
                            <Input
                                placeholder="เบอร์โทร หรือ เลขบัตรประชาชน"
                                value={bankInfo.promptPayNumber}
                                onChange={(e) => setBankInfo({ ...bankInfo, promptPayNumber: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                ใช้สร้าง QR Code สำหรับรับเงินอัตโนมัติ
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label>ประเภทเลข PromptPay</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="promptPayType"
                                        checked={bankInfo.promptPayType === 'PHONE'}
                                        onChange={() => setBankInfo({ ...bankInfo, promptPayType: 'PHONE' })}
                                        className="h-4 w-4"
                                    />
                                    เบอร์โทรศัพท์
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="promptPayType"
                                        checked={bankInfo.promptPayType === 'ID_CARD'}
                                        onChange={() => setBankInfo({ ...bankInfo, promptPayType: 'ID_CARD' })}
                                        className="h-4 w-4"
                                    />
                                    บัตรประชาชน
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PromptPay Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            ตัวอย่าง QR PromptPay
                        </CardTitle>
                        <CardDescription>ลูกค้าจะเห็น QR นี้ในหน้าชำระเงิน</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <PromptPayQR
                            mobileNumber={bankInfo.promptPayNumber || undefined}
                            amount={100}
                            size={200}
                        />
                    </CardContent>
                </Card>

                {/* Shipping Rates */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            ค่าจัดส่ง
                        </CardTitle>
                        <CardDescription>ตั้งค่าวิธีคิดค่าส่งและราคา</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <Label className="text-base font-medium">โหมดการคิดค่าส่ง</Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label
                                    className={`flex flex-col gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${shippingRates.mode === 'PER_ORDER'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="shippingMode"
                                            checked={shippingRates.mode === 'PER_ORDER'}
                                            onChange={() => setShippingRates({ ...shippingRates, mode: 'PER_ORDER' })}
                                            className="h-4 w-4"
                                        />
                                        <span className="font-medium">ต่อออเดอร์ (Flat Rate)</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        คิดค่าส่งคงที่ต่อ 1 คำสั่งซื้อ ไม่ว่าจะสั่งกี่ชิ้น
                                    </p>
                                    {shippingRates.mode === 'PER_ORDER' && (
                                        <div className="flex items-center gap-2 pl-6 pt-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="w-24"
                                                value={shippingRates.perOrderRate}
                                                onChange={(e) => setShippingRates({
                                                    ...shippingRates,
                                                    perOrderRate: parseFloat(e.target.value) || 0
                                                })}
                                            />
                                            <span className="text-sm">บาท/ออเดอร์</span>
                                        </div>
                                    )}
                                </label>

                                <label
                                    className={`flex flex-col gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${shippingRates.mode === 'PER_PIECE'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="shippingMode"
                                            checked={shippingRates.mode === 'PER_PIECE'}
                                            onChange={() => setShippingRates({ ...shippingRates, mode: 'PER_PIECE' })}
                                            className="h-4 w-4"
                                        />
                                        <span className="font-medium">ต่อชิ้น</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        คิดค่าส่งตามจำนวนสินค้า ยิ่งสั่งมากค่าส่งยิ่งเพิ่ม
                                    </p>
                                    {shippingRates.mode === 'PER_PIECE' && (
                                        <div className="flex items-center gap-2 pl-6 pt-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="w-24"
                                                value={shippingRates.perPieceRate}
                                                onChange={(e) => setShippingRates({
                                                    ...shippingRates,
                                                    perPieceRate: parseFloat(e.target.value) || 0
                                                })}
                                            />
                                            <span className="text-sm">บาท/ชิ้น</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm font-medium mb-2">ตัวอย่างการคำนวณ:</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                                {shippingRates.mode === 'PER_ORDER' ? (
                                    <>
                                        <p>สั่ง 1 ชิ้น = ค่าส่ง ฿{shippingRates.perOrderRate}</p>
                                        <p>สั่ง 5 ชิ้น = ค่าส่ง ฿{shippingRates.perOrderRate}</p>
                                        <p>สั่ง 10 ชิ้น = ค่าส่ง ฿{shippingRates.perOrderRate}</p>
                                    </>
                                ) : (
                                    <>
                                        <p>สั่ง 1 ชิ้น = ค่าส่ง ฿{shippingRates.perPieceRate * 1}</p>
                                        <p>สั่ง 5 ชิ้น = ค่าส่ง ฿{shippingRates.perPieceRate * 5}</p>
                                        <p>สั่ง 10 ชิ้น = ค่าส่ง ฿{shippingRates.perPieceRate * 10}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Telegram Notifications */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.07-.06-.17-.04-.24-.03-.11.03-1.79 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.87-.44-.75-.24-1.35-.37-1.3-.79.03-.22.35-.45.96-.68 3.77-1.64 6.28-2.72 7.54-3.24 3.59-1.5 4.33-1.76 4.82-1.77.11 0 .35.03.5.18.13.12.16.28.18.45-.01.12-.02.37-.04.63z" />
                            </svg>
                            แจ้งเตือน Telegram
                        </CardTitle>
                        <CardDescription>ตั้งค่า Bot Token และ Chat ID เพื่อรับแจ้งเตือนออเดอร์ใหม่</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Bot Token</Label>
                            <Input
                                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                value={telegramBotToken}
                                onChange={(e) => setTelegramBotToken(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                สร้าง Bot ที่ @BotFather แล้วคัดลอก Token มาวาง
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Chat ID</Label>
                            <Input
                                placeholder="-1001234567890"
                                value={telegramChatId}
                                onChange={(e) => setTelegramChatId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                ID ของ Chat หรือ Group ที่ต้องการรับแจ้งเตือน (ใช้ @userinfobot เพื่อหา ID)
                            </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleTestTelegram}
                                disabled={testingTelegram || !telegramBotToken || !telegramChatId}
                            >
                                {testingTelegram ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <span className="mr-2">📤</span>
                                )}
                                ทดสอบส่งข้อความ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
