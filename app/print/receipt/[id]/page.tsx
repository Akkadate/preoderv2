import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PrintButton } from './PrintButton'
import { Metadata } from 'next'
import { cache } from 'react'

interface PageProps {
    params: Promise<{ id: string }>
}

interface OrderWithDetails {
    id: string
    code: string
    totalAmount: any // Decimal
    shippingCost: any // Decimal
    grandTotal: any // Decimal
    shippingAddress: string | any | null // JSON
    createdAt: Date
    paymentMethod: string
    customer: {
        name: string
        contactInfo: string
    } | null
    items: {
        id: string
        name: string
        quantity: number
        price: any // Decimal
        totalPrice: any // Decimal
    }[]
    round: {
        shop: {
            name: string
        }
    }
}

const getOrder = cache(async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            round: {
                include: {
                    shop: {
                        select: {
                            name: true,
                        }
                    },
                },
            },
            items: true,
        },
    })
    return order
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params
    const order = await getOrder(resolvedParams.id)
    return {
        title: order ? `ใบเสร็จรับเงิน - ${order.code}` : 'ไม่พบคำสั่งซื้อ',
    }
}

export default async function PrintReceiptPage({ params }: PageProps) {
    const resolvedParams = await params
    const orderData = await getOrder(resolvedParams.id)

    if (!orderData) {
        notFound()
    }

    const order = orderData as unknown as OrderWithDetails

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

    const shopName = order.round?.shop?.name || 'ร้านค้า'
    const orderDate = new Date(order.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className="print-page-container min-h-screen bg-white text-black p-10">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; background: white; }
                    .no-print { display: none !important; }
                    nav, footer, .cart-controller { display: none; }
                }
                
                .print-page-container {
                    font-family: 'Sarabun', sans-serif; 
                    max-width: 21cm; /* A4 width */
                    margin: 0 auto;
                    font-size: 14px;
                }

                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                }
                .shop-name { 
                    font-size: 24px; 
                    font-weight: bold; 
                    margin-bottom: 5px;
                }
                .doc-title {
                    font-size: 18px;
                    font-weight: bold;
                    border: 1px solid #000;
                    padding: 5px 15px;
                    display: inline-block;
                    margin-top: 10px;
                    border-radius: 4px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .box {
                    border: 1px solid #ccc;
                    padding: 15px;
                    border-radius: 4px;
                }
                .box-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                    color: #666;
                }
                .row {
                    display: flex;
                    margin-bottom: 5px;
                }
                .label {
                    width: 100px;
                    color: #666;
                }
                .value {
                    flex: 1;
                    font-weight: 500;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #f9f9f9;
                    font-weight: bold;
                    text-align: center;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
                
                /* Button Style */
                .print-btn {
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 14px;
                }
                .print-btn:hover {
                    background: #333;
                }
            `}} />

            <div className="header">
                <div className="shop-name">{shopName}</div>
                <div className="doc-title">ใบเสร็จรับเงิน / Receipt</div>
            </div>

            <div className="info-grid">
                <div className="box">
                    <div className="box-title">ลูกค้า (Customer)</div>
                    <div className="row">
                        <div className="label">ชื่อ:</div>
                        <div className="value">{shippingAddress.name || order.customer?.name || '-'}</div>
                    </div>
                    <div className="row">
                        <div className="label">เบอร์โทร:</div>
                        <div className="value">{shippingAddress.phone || order.customer?.contactInfo || '-'}</div>
                    </div>
                    <div className="row">
                        <div className="label">ที่อยู่:</div>
                        <div className="value">{shippingAddress.address || '-'}</div>
                    </div>
                </div>
                <div className="box">
                    <div className="box-title">ข้อมูลคำสั่งซื้อ (Order Info)</div>
                    <div className="row">
                        <div className="label">เลขที่:</div>
                        <div className="value">#{order.code}</div>
                    </div>
                    <div className="row">
                        <div className="label">วันที่:</div>
                        <div className="value">{orderDate}</div>
                    </div>
                    <div className="row">
                        <div className="label">ชำระโดย:</div>
                        <div className="value">{order.paymentMethod === 'SLIP' ? 'โอนเงิน' : 'QR PromptPay'}</div>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>รายการสินค้า</th>
                        <th style={{ width: '100px' }}>ราคาต่อชิ้น</th>
                        <th style={{ width: '80px' }}>จำนวน</th>
                        <th style={{ width: '120px' }}>รวม</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item: any, index: number) => (
                        <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>{item.name}</td>
                            <td className="text-right">฿{Number(item.price).toLocaleString()}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">฿{Number(item.totalPrice).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} className="text-right font-bold">รวมเป็นเงิน (Subtotal)</td>
                        <td className="text-right">฿{Number(order.totalAmount).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="text-right font-bold">ค่าจัดส่ง (Shipping)</td>
                        <td className="text-right">฿{Number(order.shippingCost).toLocaleString()}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <td colSpan={4} className="text-right font-bold" style={{ fontSize: '16px' }}>ยอดสุทธิ (Grand Total)</td>
                        <td className="text-right font-bold" style={{ fontSize: '16px' }}>฿{Number(order.grandTotal).toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="footer">
                ขอบคุณที่อุดหนุนสินค้าของเรา
                <br />Thank you for your business.
            </div>

            <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
                <PrintButton />
            </div>
        </div>
    )
}
