import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSelectedShopIds } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
    try {
        const shopIds = await getSelectedShopIds()
        if (!shopIds || shopIds.length === 0) {
            return NextResponse.json({ error: 'No shops selected' }, { status: 400 })
        }

        const searchParams = request.nextUrl.searchParams
        const period = searchParams.get('period') || 'month' // day, week, month

        // Calculate date range
        const now = new Date()
        let startDate: Date

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                break
            case 'week':
                startDate = new Date(now)
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                break
        }

        // Get completed orders
        const orders = await prisma.order.findMany({
            where: {
                round: { shopId: { in: shopIds } },
                status: { in: ['CONFIRMED', 'SHIPPED', 'COMPLETED'] },
                createdAt: { gte: startDate }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, costPrice: true }
                        }
                    }
                }
            }
        })

        // Calculate totals
        let totalRevenue = 0
        let totalCost = 0
        let totalOrders = orders.length
        let totalItems = 0

        const productSales: Record<string, { name: string, qty: number, revenue: number, profit: number }> = {}

        for (const order of orders) {
            totalRevenue += Number(order.grandTotal)

            for (const item of order.items) {
                totalItems += item.quantity
                const revenue = Number(item.subtotal)
                const costPrice = item.product?.costPrice ? Number(item.product.costPrice) : 0
                const itemCost = costPrice * item.quantity
                totalCost += itemCost

                // Track product sales
                const productName = item.name
                if (!productSales[productName]) {
                    productSales[productName] = { name: productName, qty: 0, revenue: 0, profit: 0 }
                }
                productSales[productName].qty += item.quantity
                productSales[productName].revenue += revenue
                productSales[productName].profit += revenue - itemCost
            }
        }

        const totalProfit = totalRevenue - totalCost

        // Get top selling products
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 10)

        // Group by date for chart
        const dailyData: Record<string, { date: string, revenue: number, orders: number }> = {}

        for (const order of orders) {
            const dateKey = order.createdAt.toISOString().split('T')[0]
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, revenue: 0, orders: 0 }
            }
            dailyData[dateKey].revenue += Number(order.grandTotal)
            dailyData[dateKey].orders += 1
        }

        const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({
            summary: {
                totalRevenue,
                totalCost,
                totalProfit,
                totalOrders,
                totalItems,
                profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
            },
            topProducts,
            chartData,
            period
        })

    } catch (error) {
        console.error('Finance API error:', error)
        return NextResponse.json({ error: 'Failed to fetch finance data' }, { status: 500 })
    }
}
