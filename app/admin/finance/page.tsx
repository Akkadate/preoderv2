'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Package, ShoppingCart, Loader2 } from 'lucide-react'

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

export default function FinancePage() {
    const [data, setData] = useState<FinanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')

    useEffect(() => {
        fetchData()
    }, [period])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/finance?period=${period}`)
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const periodLabels = {
        day: 'วันนี้',
        week: '7 วันล่าสุด',
        month: 'เดือนนี้'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                ไม่สามารถโหลดข้อมูลได้
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">รายงานการเงิน</h1>
                    <p className="text-muted-foreground">ภาพรวมรายได้และกำไร</p>
                </div>
                <div className="flex gap-2">
                    {(['day', 'week', 'month'] as const).map((p) => (
                        <Button
                            key={p}
                            variant={period === p ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(p)}
                        >
                            {periodLabels[p]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.summary.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {periodLabels[period]}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">กำไรสุทธิ</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(data.summary.totalProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Margin: {data.summary.profitMargin}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">คำสั่งซื้อ</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.summary.totalOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            รายการ
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">สินค้าขายได้</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.summary.totalItems}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ชิ้น
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle>สินค้าขายดี</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {data.topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="w-8 justify-center">
                                            {index + 1}
                                        </Badge>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-muted-foreground">
                                            {product.qty} ชิ้น
                                        </span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(product.revenue)}
                                        </span>
                                        {product.profit > 0 && (
                                            <span className="text-blue-600">
                                                +{formatCurrency(product.profit)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            ยังไม่มีข้อมูลการขาย
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Daily Revenue Chart (Simple) */}
            {data.chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>รายได้รายวัน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.chartData.map((day) => {
                                const maxRevenue = Math.max(...data.chartData.map(d => d.revenue))
                                const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0

                                return (
                                    <div key={day.date} className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground w-24">
                                            {new Date(day.date).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-24 text-right">
                                            {formatCurrency(day.revenue)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
