import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getOrder(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            round: {
                include: {
                    shop: true,
                },
            },
            items: true,
        },
    })

    return order
}

export default async function ReceiptPage({ params }: PageProps) {
    const resolvedParams = await params
    const order = await getOrder(resolvedParams.id)

    if (!order) {
        notFound()
    }

    const shop = order.round.shop
    const bankInfo = shop.bankInfo as { bankName?: string; accNo?: string; accName?: string } | null

    return (
        <html>
            <head>
                <title>ใบเสร็จ - {order.code}</title>
                <style dangerouslySetInnerHTML={{
                    __html: `
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Sarabun', 'Segoe UI', sans-serif; 
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .shop-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .receipt-title { font-size: 18px; color: #666; }
          .receipt-code { font-size: 14px; color: #888; margin-top: 10px; }
          
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; font-size: 14px; color: #666; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { }
          .info-label { font-size: 12px; color: #888; }
          .info-value { font-size: 14px; margin-top: 2px; }
          
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th { text-align: left; padding: 10px 0; border-bottom: 2px solid #333; font-size: 12px; color: #666; }
          .items-table td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; }
          .items-table .qty { text-align: center; width: 60px; }
          .items-table .price { text-align: right; width: 100px; }
          .items-table .total { text-align: right; width: 120px; }
          
          .summary { margin-top: 20px; border-top: 2px solid #333; padding-top: 15px; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
          .summary-row.grand { font-size: 18px; font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
          
          .bank-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .bank-title { font-weight: bold; margin-bottom: 10px; }
          .bank-detail { font-size: 14px; margin: 5px 0; }
          .bank-account { font-size: 18px; font-weight: bold; font-family: monospace; }
          
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
          
          .print-btn { 
            position: fixed; 
            bottom: 20px; 
            right: 20px; 
            background: #333; 
            color: white; 
            border: none; 
            padding: 15px 30px; 
            font-size: 16px; 
            border-radius: 8px; 
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          .print-btn:hover { background: #555; }
          
          .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status.pending { background: #fff3cd; color: #856404; }
          .status.paid { background: #d4edda; color: #155724; }
          .status.confirmed { background: #cce5ff; color: #004085; }
          .status.shipped { background: #d1ecf1; color: #0c5460; }
          .status.completed { background: #d4edda; color: #155724; }
          .status.cancelled { background: #f8d7da; color: #721c24; }
        `}} />
            </head>
            <body>
                <button id="printBtn" className="print-btn no-print">🖨️ พิมพ์ใบเสร็จ</button>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    document.getElementById('printBtn').addEventListener('click', function() {
                        window.print();
                    });
                `}} />

                <div className="header">
                    <div className="shop-name">{shop.name}</div>
                    <div className="receipt-title">ใบเสร็จรับเงิน / Receipt</div>
                    <div className="receipt-code">
                        รหัส: <strong>{order.code}</strong>
                        <span className={`status ${order.status.toLowerCase()}`} style={{ marginLeft: '10px' }}>
                            {order.status === 'PENDING' && 'รอชำระเงิน'}
                            {order.status === 'PAID_WAITING' && 'รอยืนยัน'}
                            {order.status === 'CONFIRMED' && 'ยืนยันแล้ว'}
                            {order.status === 'SHIPPED' && 'จัดส่งแล้ว'}
                            {order.status === 'COMPLETED' && 'สำเร็จ'}
                            {order.status === 'CANCELLED' && 'ยกเลิก'}
                        </span>
                    </div>
                </div>

                <div className="section">
                    <div className="section-title">ข้อมูลลูกค้า</div>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">ชื่อ</div>
                            <div className="info-value">{order.customer?.name || '-'}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">เบอร์โทร</div>
                            <div className="info-value">{order.customer?.contactInfo || '-'}</div>
                        </div>
                        <div className="info-item" style={{ gridColumn: 'span 2' }}>
                            <div className="info-label">ที่อยู่จัดส่ง</div>
                            <div className="info-value">
                                {order.shippingAddress
                                    ? (order.shippingAddress as any).address || '-'
                                    : order.customer?.address || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-title">รายการสินค้า</div>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>รายการ</th>
                                <th className="qty">จำนวน</th>
                                <th className="price">ราคา/หน่วย</th>
                                <th className="total">รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td className="qty">{item.quantity}</td>
                                    <td className="price">฿{Number(item.price).toLocaleString()}</td>
                                    <td className="total">฿{Number(item.totalPrice).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="summary">
                        <div className="summary-row">
                            <span>ค่าสินค้า</span>
                            <span>฿{Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>ค่าจัดส่ง</span>
                            <span>฿{Number(order.shippingCost).toLocaleString()}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                            <div className="summary-row" style={{ color: 'green' }}>
                                <span>ส่วนลด</span>
                                <span>-฿{Number(order.discount).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="summary-row grand">
                            <span>รวมทั้งหมด</span>
                            <span>฿{Number(order.grandTotal).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {order.status === 'PENDING' && bankInfo && (
                    <div className="bank-info">
                        <div className="bank-title">💳 ข้อมูลการโอนเงิน</div>
                        <div className="bank-detail">ธนาคาร: {bankInfo.bankName}</div>
                        <div className="bank-detail">เลขบัญชี: <span className="bank-account">{bankInfo.accNo}</span></div>
                        <div className="bank-detail">ชื่อบัญชี: {bankInfo.accName}</div>
                    </div>
                )}

                {order.trackingCode && (
                    <div className="section">
                        <div className="section-title">ข้อมูลจัดส่ง</div>
                        <div className="info-item">
                            <div className="info-label">เลขพัสดุ</div>
                            <div className="info-value" style={{ fontFamily: 'monospace', fontSize: '18px' }}>
                                {order.trackingCode}
                            </div>
                        </div>
                    </div>
                )}

                <div className="footer">
                    <p>วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleString('th-TH')}</p>
                    <p style={{ marginTop: '5px' }}>ขอบคุณที่ใช้บริการ {shop.name}</p>
                </div>
            </body>
        </html>
    )
}
