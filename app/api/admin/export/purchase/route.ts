import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { getSelectedShopIds } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
    try {
        console.log('[Export Purchase] Start request')
        const shopIds = await getSelectedShopIds()
        if (!shopIds || shopIds.length === 0) {
            return NextResponse.json({ error: 'No shops selected' }, { status: 400 })
        }

        const searchParams = request.nextUrl.searchParams
        const roundId = searchParams.get('roundId')

        if (!roundId || roundId === 'all') {
            return NextResponse.json({ error: 'Round ID is required for Purchase List' }, { status: 400 })
        }

        // Get Round Info
        const round = await prisma.round.findUnique({
            where: { id: roundId },
            include: { shop: true }
        })

        if (!round) {
            return NextResponse.json({ error: 'Round not found' }, { status: 404 })
        }

        console.log(`[Export Purchase] Processing Round: ${roundId}, Shop: ${round.shopId}`)

        // Fetch Order Items from confirmed orders in this round
        const items = await prisma.orderItem.findMany({
            where: {
                order: {
                    roundId: roundId,
                    status: { in: ['PAID_WAITING', 'CONFIRMED', 'SHIPPED', 'COMPLETED'] },
                    // Note: Filtering by order's shopId via relation
                    shopId: { in: shopIds }
                }
            },
            include: {
                product: {
                    select: {
                        name: true,
                        costPrice: true
                    }
                }
            }
        })

        console.log(`[Export Purchase] Found ${items.length} items to aggregate`)

        // Aggregate Data
        const aggregated: Record<string, { name: string, qty: number, cost: number }> = {}

        for (const item of items) {
            const key = item.name || 'สินค้าไม่ระบุชื่อ'

            if (!aggregated[key]) {
                const prod = (item as any).product
                let cost = 0
                if (prod?.costPrice) {
                    cost = Number(prod.costPrice)
                    if (isNaN(cost)) cost = 0
                }

                aggregated[key] = {
                    name: key,
                    qty: 0,
                    cost: cost
                }
            }
            aggregated[key].qty += (Number(item.quantity) || 0)
        }

        const rows = Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name))

        // Create Excel
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Purchase List')

        // Header Info
        worksheet.addRow([`ใบสั่งซื้อสินค้า (Purchase List)`])
        worksheet.addRow([`ร้าน: ${round.shop?.name || '-'}`])
        worksheet.addRow([`รอบ: ${round.name || '-'}`])
        worksheet.addRow([`วันที่ออกรายงาน: ${new Date().toLocaleString('th-TH')}`])
        worksheet.addRow([])

        // Table Header
        worksheet.addRow(['ลำดับ', 'รายการสินค้า', 'จำนวนที่ต้องสั่ง', 'ต้นทุนต่อชิ้น', 'ต้นทุนรวม'])

        // Data Rows
        let totalQty = 0
        let totalCost = 0

        rows.forEach((row, index) => {
            let totalRowCost = row.cost * row.qty
            if (isNaN(totalRowCost)) totalRowCost = 0

            worksheet.addRow([
                index + 1,
                row.name,
                row.qty,
                row.cost,
                totalRowCost
            ])
            totalQty += row.qty
            totalCost += totalRowCost
        })

        worksheet.addRow([])
        worksheet.addRow(['', 'รวมทั้งสิ้น', totalQty, '', totalCost])

        // Styling
        worksheet.getColumn(1).width = 10
        worksheet.getColumn(2).width = 40
        worksheet.getColumn(3).width = 15
        worksheet.getColumn(4).width = 15
        worksheet.getColumn(5).width = 15

        // Apply Prompt font to all cells
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.font = { name: 'Prompt', size: 11 }
            })
        })

        // Make header row bold
        const headerRow = worksheet.getRow(6) // Table header is on row 6
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Prompt', size: 11, bold: true }
        })

        console.log('[Export Purchase] Generating buffer...')
        const buffer = await workbook.xlsx.writeBuffer()
        console.log('[Export Purchase] Success')

        // Sanitize filename
        const safeFilename = `purchase_list_${(round.name || 'round').replace(/[^a-z0-9ก-๙]/gi, '_')}.xlsx`

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"`
            }
        })

    } catch (error: any) {
        console.error('Purchase List Export Error Detail:', error)
        return NextResponse.json({
            error: 'Failed to export purchase list',
            detail: error?.message || String(error)
        }, { status: 500 })
    }
}
