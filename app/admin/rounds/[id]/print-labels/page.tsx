import { prisma } from '@/lib/prisma'
import { getSelectedShopIds } from '@/lib/auth-utils'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { BatchPrintButton } from './BatchPrintButton'

interface PageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const round = await prisma.round.findUnique({
        where: { id },
        select: { name: true }
    })
    return {
        title: round ? `พิมพ์ใบปะหน้า - ${round.name}` : 'ไม่พบรอบ',
    }
}

export default async function BatchPrintLabelsPage({ params }: PageProps) {
    const { id: roundId } = await params

    // 1. Verify Access
    const shopIds = await getSelectedShopIds()
    if (!shopIds || shopIds.length === 0) {
        redirect('/admin')
    }

    // 2. Get Round Info
    const round = await prisma.round.findUnique({
        where: { id: roundId },
        include: { shop: true }
    })

    if (!round || !shopIds.includes(round.shopId)) {
        notFound()
    }

    // 3. Fetch all orders in this round (with confirmed statuses)
    const orders = await prisma.order.findMany({
        where: {
            roundId: roundId,
            status: { in: ['PAID_WAITING', 'CONFIRMED', 'SHIPPED', 'COMPLETED'] }
        },
        include: {
            customer: true,
            items: true
        },
        orderBy: { createdAt: 'asc' }
    })

    if (orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">ไม่มีรายการที่ต้องพิมพ์</h1>
                    <p className="text-gray-500">รอบนี้ยังไม่มีออเดอร์ที่ชำระเงินแล้ว</p>
                </div>
            </div>
        )
    }

    const shopName = round.shop.name

    return (
        <div className="print-page-container bg-white text-black">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700&display=swap');
                
                @media print {
                    @page { 
                        margin: 3mm; 
                        size: A4; 
                    }
                    
                    /* AGGRESSIVELY HIDE ALL ADMIN ELEMENTS */
                    body * {
                        visibility: visible;
                    }
                    
                    /* Hide everything except our print container */
                    body > div:not(.print-page-container),
                    body > div > *:not(.print-page-container),
                    header, nav, aside, footer,
                    [class*="sidebar"],
                    [class*="navbar"],
                    [class*="header"],
                    [class*="Admin"],
                    [class*="admin"],
                    .no-print {
                        display: none !important;
                        visibility: hidden !important;
                        height: 0 !important;
                        width: 0 !important;
                        overflow: hidden !important;
                        position: absolute !important;
                        left: -9999px !important;
                    }
                    
                    /* Make our container the only thing visible */
                    .print-page-container {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        z-index: 999999 !important;
                    }
                    
                    /* 2x2 Grid for 4 labels per page */
                    .labels-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        grid-template-rows: 1fr 1fr !important;
                        gap: 3mm !important;
                        width: 100% !important;
                        height: calc(100vh - 6mm) !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .label-wrapper {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin: 0 !important;
                        height: calc(50vh - 5mm) !important;
                        overflow: hidden !important;
                    }
                    
                    /* Force page break after every 4 labels */
                    .label-wrapper:nth-child(4n) {
                        page-break-after: always !important;
                    }
                    
                    .label-wrapper:last-child {
                        page-break-after: auto !important;
                    }
                    
                    .label {
                        height: 100% !important;
                        box-sizing: border-box !important;
                    }
                }
                
                /* Screen styles */
                .print-page-container {
                    font-family: 'Prompt', sans-serif;
                    background: #f5f5f5;
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .labels-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .label-wrapper {
                    margin: 0;
                }

                .label { 
                    border: 2px solid #000; 
                    padding: 12px;
                    background: white;
                    height: 100%;
                    font-size: 13px;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px dashed #000;
                    padding-bottom: 8px;
                    margin-bottom: 8px;
                }
                .shop-name { 
                    font-size: 15px; 
                    font-weight: bold; 
                }
                .order-code { 
                    font-size: 22px; 
                    font-weight: bold;
                    margin: 5px 0;
                }
                .section { 
                    margin: 6px 0;
                    padding: 6px 0;
                    border-bottom: 1px dashed #ccc;
                }
                .section:last-child { border-bottom: none; }
                .section-title { 
                    font-size: 11px;
                    color: #666;
                    margin-bottom: 3px;
                }
                .customer-name { 
                    font-size: 15px; 
                    font-weight: bold; 
                }
                .customer-phone { 
                    font-size: 13px;
                    margin-top: 3px;
                }
                .address { 
                    font-size: 12px; 
                    line-height: 1.3;
                    margin-top: 3px;
                }
                .items { 
                    font-size: 11px; 
                }
                .item { 
                    display: flex;
                    justify-content: space-between;
                    padding: 2px 0;
                }
                .total { 
                    font-size: 14px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 6px;
                }
            `}} />

            {/* Print Button */}
            <div className="no-print max-w-md mx-auto p-4 mb-4 text-center space-y-2">
                <h1 className="text-xl font-bold">พิมพ์ใบปะหน้าทั้งรอบ</h1>
                <p className="text-gray-500 text-sm">รอบ: {round.name} ({orders.length} รายการ)</p>
                <BatchPrintButton count={orders.length} />
            </div>

            {/* All Labels in Grid */}
            <div className="labels-grid">
                {orders.map((order) => {
                    // Parse shipping address
                    let shippingAddress: any = {}
                    if (order.shippingAddress) {
                        try {
                            shippingAddress = typeof order.shippingAddress === 'string'
                                ? JSON.parse(order.shippingAddress)
                                : order.shippingAddress
                        } catch (e) {
                            shippingAddress = {}
                        }
                    }

                    return (
                        <div key={order.id} className="label-wrapper">
                            <div className="label">
                                {/* Header - Shop Info */}
                                <div className="header">
                                    <div className="shop-name">{shopName}</div>
                                    <div className="order-code">#{order.code}</div>
                                </div>

                                {/* Customer Info */}
                                <div className="section">
                                    <div className="section-title">📦 ผู้รับ</div>
                                    <div className="customer-name">{shippingAddress.name || order.customer?.name || '-'}</div>
                                    <div className="customer-phone">📞 {shippingAddress.phone || order.customer?.contactInfo || '-'}</div>
                                    {shippingAddress.address && (
                                        <div className="address">📍 {shippingAddress.address}</div>
                                    )}
                                </div>

                                {/* Items */}
                                <div className="section">
                                    <div className="section-title">🛒 รายการสินค้า</div>
                                    <div className="items">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="item">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>฿{Number(item.totalPrice).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="total">
                                        รวม: ฿{Number(order.grandTotal).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
