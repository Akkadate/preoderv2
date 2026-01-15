import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { startOfDay, endOfDay, subDays, startOfMonth, startOfWeek } from 'date-fns'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const shopId = searchParams.get('shopId')
        const period = searchParams.get('period') || 'today'
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')

        const roundId = searchParams.get('roundId')

        // Reuse logic from finance api (simplified)
        let startDate = startOfDay(new Date())
        let endDate = endOfDay(new Date())

        if (startDateParam && endDateParam) {
            // ... (keep existing date logic)
            startDate = startOfDay(new Date(startDateParam))
            endDate = endOfDay(new Date(endDateParam))
        } else {
            // ... (keep existing period logic)
            const now = new Date()
            switch (period) {
                case 'today':
                    startDate = startOfDay(now)
                    endDate = endOfDay(now)
                    break
                case 'yesterday':
                    startDate = startOfDay(subDays(now, 1))
                    endDate = endOfDay(subDays(now, 1))
                    break
                case 'week':
                    startDate = startOfWeek(now, { weekStartsOn: 1 })
                    endDate = endOfDay(now)
                    break
                case 'month':
                    startDate = startOfMonth(now)
                    endDate = endOfDay(now)
                    break
                case 'all':
                    startDate = new Date(0)
                    endDate = endOfDay(now)
                    break
            }
        }

        const where: any = {
            status: { not: 'CANCELLED' }, // Only non-cancelled orders
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }

        if (shopId && shopId !== 'all') {
            where.round = { ...where.round, shopId }
        }

        if (roundId && roundId !== 'all') {
            where.roundId = roundId
            // If filtering by round, date range might assume secondary importance or still apply within that round?
            // Usually if selecting a Round, we might want ALL orders in that round regardless of date.
            // But let's keep date filter active if user selected 'month' + 'round'.
            // However, usually 'Round' implies a specific timeframe.
            // Let's decide: If roundId is present, should we ignore date?
            // User request: "See revenue by round". So probably YES, ignore date if round is specific.
            delete where.createdAt // Remove date constraint if round is specific
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                round: {
                    include: {
                        shop: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // -- Calculation Logic --
        // 1. Daily Summary
        const dailyStats: Record<string, { revenue: number, cost: number, profit: number, orders: number }> = {}
        // 2. Product Summary
        const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {}

        let totalRevenue = 0
        let totalCost = 0
        let totalProfit = 0

        orders.forEach(order => {
            const dateKey = new Date(order.createdAt).toLocaleDateString('th-TH')

            if (!dailyStats[dateKey]) {
                dailyStats[dateKey] = { revenue: 0, cost: 0, profit: 0, orders: 0 }
            }

            let orderCost = 0
            order.items.forEach(item => {
                // Product Stats
                const productId = item.productId
                if (!productStats[productId]) {
                    productStats[productId] = { name: item.name, quantity: 0, revenue: 0 }
                }
                productStats[productId].quantity += item.quantity
                productStats[productId].revenue += Number(item.totalPrice)

                // Cost Calc
                const prod = item.product as any
                const costPrice = prod?.costPrice ? Number(prod.costPrice) : 0
                orderCost += costPrice * item.quantity
            })

            const revenue = Number(order.totalAmount) // Exclude shipping from product revenue/profit? or include? usually exclude shipping.
            // Wait, let's use grandTotal for revenue or totalAmount? 
            // Revenue usually means Total Sales (Goods).

            const profit = Number(order.totalAmount) - orderCost
            // Note: Profit here is Gross Profit from Goods. Not accounting for shipping cost vs shipping fee.

            dailyStats[dateKey].revenue += Number(order.totalAmount)
            dailyStats[dateKey].cost += orderCost
            dailyStats[dateKey].profit += profit
            dailyStats[dateKey].orders += 1

            totalRevenue += Number(order.totalAmount)
            totalCost += orderCost
            totalProfit += profit
        })

        // -- Excel Generation --
        const workbook = new ExcelJS.Workbook()

        // Sheet 1: Overview
        const sheet1 = workbook.addWorksheet('Overview')
        sheet1.columns = [
            { header: 'วันที่', key: 'date', width: 15 },
            { header: 'จำนวนออเดอร์', key: 'orders', width: 15 },
            { header: 'ยอดขาย (บาท)', key: 'revenue', width: 20 },
            { header: 'ต้นทุน (บาท)', key: 'cost', width: 20 },
            { header: 'กำไร (บาท)', key: 'profit', width: 20 },
        ]

        sheet1.getRow(1).font = { bold: true }

        Object.entries(dailyStats).forEach(([date, stats]) => {
            sheet1.addRow({
                date,
                orders: stats.orders,
                revenue: stats.revenue,
                cost: stats.cost,
                profit: stats.profit
            })
        })

        // Summary Row
        sheet1.addRow({})
        const totalRow = sheet1.addRow({
            date: 'รวมทั้งหมด',
            orders: orders.length,
            revenue: totalRevenue,
            cost: totalCost,
            profit: totalProfit
        })
        totalRow.font = { bold: true }

        // Sheet 2: Product Performance
        const sheet2 = workbook.addWorksheet('Top Products')
        sheet2.columns = [
            { header: 'ชื่อสินค้า', key: 'name', width: 40 },
            { header: 'จำนวนที่ขายได้ (ชิ้น)', key: 'quantity', width: 20 },
            { header: 'ยอดขายรวม (บาท)', key: 'revenue', width: 20 },
        ]
        sheet2.getRow(1).font = { bold: true }

        // Sort by revenue desc
        const sortedProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue)

        sortedProducts.forEach(p => {
            sheet2.addRow({
                name: p.name,
                quantity: p.quantity,
                revenue: p.revenue
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="finance_report_${new Date().toISOString().split('T')[0]}.xlsx"`
            }
        })

    } catch (error) {
        console.error('Export Error:', error)
        return new NextResponse('Error exporting data', { status: 500 })
    }
}
