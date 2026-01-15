'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Package, ShoppingCart, Loader2 } from 'lucide-react'
import { ExportButton } from '@/components/ExportButton'
import { RoundFilter } from '@/components/RoundFilter'
import { useSearchParams } from 'next/navigation'

interface FinanceData {
    summary: {
        totalRevenue: number
        totalCost: number
        totalProfit: number
        totalOrders: number
        totalItems: number
        profitMargin: number | string
    }
    topProducts: Array<{
        name: string
        qty: number
        revenue: number
        profit: number
    }>
    chartData: Array<{
        date: string
        revenue: number
        orders: number
    }>
    period: string
}

interface Round {
    id: string
    name: string
    shop: {
        name: string
    }
}

interface FinanceDashboardProps {
    rounds: Round[]
}

export function FinanceDashboard({ rounds }: FinanceDashboardProps) {
    const [data, setData] = useState<FinanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')

    const searchParams = useSearchParams()
    const roundId = searchParams.get('roundId')

    useEffect(() => {
        fetchData()
    }, [period, roundId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('period', period)
            if (roundId) params.set('roundId', roundId)

            const res = await fetch(`/api/admin/finance?${params.toString()}`)
            if (res.ok) {
                const result = await res.json()
                setData(result)
            }
        } catch (error) {
            console.error('Failed to fetch finance data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">ภาพรวมการเงิน</h1>
                    <p className="text-muted-foreground">สรุปยอดขาย ต้นทุน และกำไร {roundId ? '(กรองตามรอบ)' : ''}</p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap justify-end">
                    <div className="w-full sm:w-auto min-w-[200px] max-w-[300px]">
                        <RoundFilter rounds={rounds} />
                    </div>

                    <div className="flex gap-2">
                        {/* Hide period toggle if round is selected */}
                        {!roundId && (
                            (['day', 'week', 'month'] as const).map((p) => (
                                <Button
                                    key={p}
                                    variant={period === p ? 'default' : 'outline'}
                                    onClick={() => setPeriod(p)}
                                    size="sm"
                                >
                                    {p === 'day' && 'วันนี้'}
                                    {p === 'week' && 'สัปดาห์นี้'}
                                    {p === 'month' && 'เดือนนี้'}
                                </Button>
                            ))
                        )}

                        <ExportButton
                            endpoint="/api/admin/export/finance"
                            filename={`finance_${roundId || period}.xlsx`}
                            label="ดาวน์โหลด"
                            variant="outline"
                            extraParams={{ period, roundId: roundId || '' }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{data.summary.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.summary.totalOrders} คำสั่งซื้อ
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">กำไรสุทธิ</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            +฿{data.summary.totalProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Margin {data.summary.profitMargin}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ต้นทุนสินค้า</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{data.summary.totalCost.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.summary.totalItems} ชิ้น
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">เฉลี่ยต่อออเดอร์</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ฿{data.summary.totalOrders > 0
                                ? Math.round(data.summary.totalRevenue / data.summary.totalOrders).toLocaleString()
                                : 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>สินค้าขายดี</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topProducts.map((product, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="font-medium">{i + 1}. {product.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">฿{product.revenue.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">{product.qty} ชิ้น</div>
                                    </div>
                                </div>
                            ))}
                            {data.topProducts.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">ไม่มีข้อมูลสินค้า</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>แนวโน้มรายวัน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.chartData.map((day, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div>{new Date(day.date).toLocaleDateString('th-TH')}</div>
                                    <div className="font-medium">฿{day.revenue.toLocaleString()}</div>
                                </div>
                            ))}
                            {data.chartData.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
