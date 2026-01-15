'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, ArrowLeft, Printer } from 'lucide-react'
import { toPng } from 'html-to-image'
import Link from 'next/link'

interface PurchaseItem {
    name: string
    qty: number
    cost: number
}

interface PurchaseListViewProps {
    items: PurchaseItem[]
    round: {
        name: string
        shop: {
            name: string
        }
    }
}

export function PurchaseListView({ items, round }: PurchaseListViewProps) {
    const [saving, setSaving] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // Load Prompt font from Google Fonts
    useEffect(() => {
        const existing = document.getElementById('prompt-font-link')
        if (!existing) {
            const link = document.createElement('link')
            link.id = 'prompt-font-link'
            link.rel = 'stylesheet'
            link.href = 'https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700&display=swap'
            document.head.appendChild(link)
        }
    }, [])

    const handleSaveImage = async () => {
        if (!contentRef.current) return
        setSaving(true)
        try {
            // Wait a bit for font to load
            await new Promise(resolve => setTimeout(resolve, 300))

            const dataUrl = await toPng(contentRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                skipFonts: true // Skip font inlining to avoid CORS errors with Google Fonts
            })

            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `purchase_list_${round.name.replace(/[^a-z0-9]/gi, '_')}.png`
            link.click()
        } catch (error) {
            console.error('Failed to save image:', error)
            alert('เกิดข้อผิดพลาดในการบันทึกภาพ กรุณาลองใหม่')
        } finally {
            setSaving(false)
        }
    }

    const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
    const totalCost = items.reduce((sum, item) => sum + (item.cost * item.qty), 0)

    return (
        <div className="space-y-6 max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between no-print">
                <Link href="/admin/orders">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับ
                    </Button>
                </Link>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        พิมพ์
                    </Button>
                    <Button onClick={handleSaveImage} disabled={saving} size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        {saving ? 'กำลังบันทึก...' : 'บันทึกเป็นรูปภาพ'}
                    </Button>
                </div>
            </div>

            <Card
                className="p-8 print:shadow-none"
                ref={contentRef}
                style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontFamily: '"Prompt", sans-serif'
                }}
            >
                <div className="space-y-6">
                    <div className="text-center space-y-2 pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <h1 className="text-xl font-bold" style={{ color: '#000000' }}>ใบสั่งซื้อสินค้า (Purchase List)</h1>
                        <div className="text-sm" style={{ color: '#4b5563' }}>
                            <p>ร้าน: {round.shop.name}</p>
                            <p>รอบ: {round.name}</p>
                            <p>วันที่: {new Date().toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>

                    <div className="min-h-[300px]">
                        <table className="w-full text-sm" style={{ color: '#000000' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }} className="text-left">
                                    <th className="py-2 pl-2">รายการสินค้า</th>
                                    <th className="py-2 text-right">จำนวน</th>
                                    <th className="py-2 text-right pr-2">ทุนรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td className="py-2 pl-2 align-top">{item.name}</td>
                                        <td className="py-2 text-right font-medium">{item.qty}</td>
                                        <td className="py-2 text-right pr-2" style={{ color: '#6b7280' }}>
                                            {new Intl.NumberFormat('th-TH').format(item.cost * item.qty)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
                                    <td className="py-3 pl-2 text-right">รวมทั้งสิ้น</td>
                                    <td className="py-3 text-right">{totalQty} ชิ้น</td>
                                    <td className="py-3 text-right pr-2">
                                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalCost)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    )
}
