'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle, Truck, XCircle, Loader2, Printer, Share2, Copy, Check } from 'lucide-react'
import { ImageDialog } from '@/components/image-dialog'

interface OrderActionsProps {
    orderId: string
    currentStatus: string
    slipImage?: string | null
}

export function OrderActions({ orderId, currentStatus, slipImage }: OrderActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [trackingCode, setTrackingCode] = useState('')
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showToast, setShowToast] = useState(false)

    const updateStatus = async (newStatus: string, additionalData?: object) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, ...additionalData }),
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
            }
        } catch (error) {
            console.error('Update error:', error)
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyUrl = async () => {
        const url = `${window.location.origin}/orders/${orderId}`
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setShowToast(true)

            setTimeout(() => {
                setCopied(false)
                setShowToast(false)
            }, 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handleConfirmPayment = () => updateStatus('CONFIRMED')
    const handleShipped = () => {
        if (trackingCode.trim()) {
            updateStatus('SHIPPED', { trackingCode: trackingCode.trim() })
            setTrackingDialogOpen(false)
        }
    }
    const handleComplete = () => updateStatus('COMPLETED')
    const handleCancel = () => updateStatus('CANCELLED')

    return (
        <div className="space-y-2">
            {/* Show slip if waiting for confirmation */}
            {currentStatus === 'PAID_WAITING' && slipImage && (
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">สลิปโอนเงิน: (คลิกเพื่อขยาย)</p>
                    <div className="max-w-xs">
                        <ImageDialog
                            src={slipImage}
                            alt="Payment slip"
                            className="max-h-48 rounded border"
                        />
                    </div>
                </div>
            )}

            {/* Confirm Payment - For PENDING or PAID_WAITING */}
            {(currentStatus === 'PENDING' || currentStatus === 'PAID_WAITING') && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            ยืนยันการชำระเงิน
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการชำระเงิน?</AlertDialogTitle>
                            <AlertDialogDescription>
                                คุณได้ตรวจสอบสลิปและยอดเงินถูกต้องแล้วใช่ไหม?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmPayment}>
                                ยืนยัน
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Add Tracking Code - For CONFIRMED */}
            {currentStatus === 'CONFIRMED' && (
                <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full" disabled={loading}>
                            <Truck className="mr-2 h-4 w-4" />
                            อัพเดตเลขพัสดุ
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>ใส่เลขพัสดุ</DialogTitle>
                            <DialogDescription>
                                กรอกเลขพัสดุเพื่ออัพเดตสถานะการจัดส่ง
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="เลขพัสดุ เช่น TH123456789"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button onClick={handleShipped} disabled={!trackingCode.trim() || loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกและจัดส่ง
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Mark as Completed - For SHIPPED */}
            {currentStatus === 'SHIPPED' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={loading}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            ลูกค้าได้รับของแล้ว
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันว่าลูกค้าได้รับของ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                การดำเนินการนี้จะทำให้ออเดอร์เสร็จสมบูรณ์
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={handleComplete}>
                                ยืนยัน
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Cancel Order - For PENDING, PAID_WAITING, CONFIRMED */}
            {['PENDING', 'PAID_WAITING', 'CONFIRMED'].includes(currentStatus) && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={loading}>
                            <XCircle className="mr-2 h-4 w-4" />
                            ยกเลิกคำสั่งซื้อ
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>ยกเลิกคำสั่งซื้อ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>ไม่ใช่</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
                                ยกเลิกออเดอร์
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Copy URL for Customer - Always available */}
            <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyUrl}
            >
                {copied ? (
                    <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        คัดลอกแล้ว
                    </>
                ) : (
                    <>
                        <Share2 className="mr-2 h-4 w-4" />
                        คัดลอก URL สำหรับลูกค้า
                    </>
                )}
            </Button>

            {/* Print Receipt - Always available */}
            <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`/receipt/${orderId}`, '_blank')}
            >
                <Printer className="mr-2 h-4 w-4" />
                พิมพ์ใบเสร็จ
            </Button>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    คัดลอก URL สำหรับลูกค้าแล้ว
                </div>
            )}
        </div>
    )
}

