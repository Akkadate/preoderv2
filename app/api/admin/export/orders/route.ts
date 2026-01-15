import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const shopId = searchParams.get('shopId')
        const roundId = searchParams.get('roundId')
        const status = searchParams.get('status')
        const search = searchParams.get('search') // For search functionality if needed

        // Construct where clause
        const where: any = {}

        if (shopId && shopId !== 'all') {
            where.round = { shopId }
        }

        if (roundId && roundId !== 'all') {
            where.roundId = roundId
        }

        if (status && status !== 'ALL') {
            where.status = status
        }

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { contactInfo: { contains: search, mode: 'insensitive' } } },
            ]
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                customer: true,
                items: true,
                round: {
                    include: {
                        shop: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Orders')

        // Define columns
        worksheet.columns = [
            { header: 'Order ID', key: 'code', width: 15 },
            { header: 'วันที่สั่งซื้อ', key: 'date', width: 20 },
            { header: 'เวลา', key: 'time', width: 10 },
            { header: 'ชื่อร้านค้า', key: 'shopName', width: 20 },
            { header: 'ชื่อลูกค้า', key: 'customerName', width: 20 },
            { header: 'เบอร์ติดต่อ', key: 'contactInfo', width: 15 },
            { header: 'ที่อยู่จัดส่ง', key: 'address', width: 40 },
            { header: 'รายการสินค้า', key: 'items', width: 50 },
            { header: 'ยอดรวม (บาท)', key: 'total', width: 15 },
            { header: 'ค่าส่ง (บาท)', key: 'shipping', width: 15 },
            { header: 'ยอดสุทธิ (บาท)', key: 'grandTotal', width: 15 },
            { header: 'สถานะ', key: 'status', width: 15 },
            { header: 'การชำระเงิน', key: 'payment', width: 15 },
        ]

        // Styling header
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        }

        // Add rows
        orders.forEach(order => {
            const createdAt = new Date(order.createdAt)
            const dateStr = createdAt.toLocaleDateString('th-TH')
            const timeStr = createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

            // Format items string
            const itemsStr = order.items.map(item => `${item.name} (${item.quantity})`).join(', ')

            // Parse shipping address
            let addressStr = '-'
            if (order.shippingAddress) {
                try {
                    const addr = typeof order.shippingAddress === 'string'
                        ? JSON.parse(order.shippingAddress)
                        : order.shippingAddress
                    addressStr = addr.address || '-'
                } catch {
                    addressStr = typeof order.shippingAddress === 'string' ? order.shippingAddress : '-'
                }
            }

            // Translate Status
            const statusMap: Record<string, string> = {
                'PENDING': 'รอชำระเงิน',
                'PAID': 'ชำระแล้ว',
                'SHIPPED': 'จัดส่งแล้ว',
                'CANCELLED': 'ยกเลิก',
                'REFUNDED': 'คืนเงิน'
            }

            worksheet.addRow({
                code: order.code,
                date: dateStr,
                time: timeStr,
                shopName: order.round?.shop?.name || '-',
                customerName: order.customer?.name || '-',
                contactInfo: order.customer?.contactInfo || '-',
                address: addressStr,
                items: itemsStr,
                total: Number(order.totalAmount),
                shipping: Number(order.shippingCost),
                grandTotal: Number(order.grandTotal),
                status: statusMap[order.status] || order.status,
                payment: (order.paymentMethod as string) === 'SLIP' ? 'โอนเงิน' : 'QR PromptPay'
            })
        })

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Return CSV/Excel response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.xlsx"`
            }
        })

    } catch (error) {
        console.error('Export Error:', error)
        return new NextResponse('Error exporting data', { status: 500 })
    }
}
