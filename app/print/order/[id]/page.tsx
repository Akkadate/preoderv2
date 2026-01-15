import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PrintButton } from './PrintButton'
import { Metadata } from 'next'
import { cache } from 'react'

interface PageProps {
    params: Promise<{ id: string }>
}

// Define the structure we expect from the query to help TypeScript
interface OrderWithDetails {
    id: string
    code: string
    totalAmount: any // Decimal
    shippingCost: any // Decimal
    grandTotal: any // Decimal
    shippingAddress: string | any | null // JSON
    customer: {
        name: string
        contactInfo: string
    } | null
    items: {
        id: string
        name: string
        quantity: number
        totalPrice: any // Decimal
    }[]
    round: {
        shop: {
            name: string
        }
    }
}

// Use React.cache to deduplicate requests if called in generateMetadata
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
        title: order ? `ใบปะหน้าพัสดุ - ${order.code}` : 'ไม่พบคำสั่งซื้อ',
    }
}

export default async function PrintOrderPage({ params }: PageProps) {
    const resolvedParams = await params
    const orderData = await getOrder(resolvedParams.id)

    if (!orderData) {
        notFound()
    }

    // Cast to our interface to avoid "property does not exist" errors
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

    // We don't need <html> or <body> here because they are provided by app/layout.tsx
    // However, we need to override styles specifically for this print view
    return (
        <div className="print-page-container min-h-screen bg-white text-black p-4">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; background: white; }
                    .no-print { display: none !important; }
                    /* Hide other elements from layout if they leak through */
                    nav, footer, .cart-controller { display: none; }
                }
                
                /* Reset layout styles that might interfere */
                .print-page-container {
                     font-family: 'Sarabun', sans-serif;
                     max-width: 10cm;
                     margin: 0 auto;
                }

                .label { 
                    border: 2px solid #000; 
                    padding: 15px;
                    background: white;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .shop-name { 
                    font-size: 18px; 
                    font-weight: bold; 
                }
                .order-code { 
                    font-size: 24px; 
                    font-weight: bold;
                    margin: 10px 0;
                }
                .section { 
                    margin: 10px 0;
                    padding: 10px 0;
                    border-bottom: 1px dashed #ccc;
                }
                .section:last-child { border-bottom: none; }
                .section-title { 
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .customer-name { 
                    font-size: 18px; 
                    font-weight: bold; 
                }
                .customer-phone { 
                    font-size: 16px;
                    margin-top: 5px;
                }
                .address { 
                    font-size: 14px; 
                    line-height: 1.4;
                    margin-top: 5px;
                }
                .items { 
                    font-size: 12px; 
                }
                .item { 
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                }
                .total { 
                    font-size: 16px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 10px;
                }
            `}} />

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

            <div className="no-print mt-5 text-center">
                <PrintButton />
            </div>

            {/* Auto print script logic could be handled in useEffect in a client component if needed, 
                but user prefers manual button click usually */}
        </div>
    )
}
