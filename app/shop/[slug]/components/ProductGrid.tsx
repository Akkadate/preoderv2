'use client'

import { Product, ShopType } from '@prisma/client'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { useState } from 'react'

interface ProductWithStock extends Product {
    soldCount: number
    remaining: number | null
    isInStock: boolean
    orderItems?: any
}

interface ProductGridProps {
    products: ProductWithStock[]
    shopType: ShopType
    shopId: string
    roundId: string
}

export default function ProductGrid({ products, shopType, shopId, roundId }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">ยังไม่มีสินค้าในรอบนี้</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    shopId={shopId}
                    roundId={roundId}
                />
            ))}
        </div>
    )
}

interface ProductCardProps {
    product: ProductWithStock
    shopId: string
    roundId: string
}

function ProductCard({ product, shopId, roundId }: ProductCardProps) {
    const [added, setAdded] = useState(false)
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            productName: product.name,
            price: Number(product.price),
            quantity: 1,
            shopId,
            roundId,
            image: product.images?.[0],
        })

        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    return (
        <Card className="flex flex-col overflow-hidden">
            {product.images && product.images.length > 0 && (
                <div className="aspect-square overflow-hidden bg-muted">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                </div>
            )}

            <CardContent className="flex-1 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{product.name}</h3>
                    {!product.isInStock && (
                        <Badge variant="destructive">หมด</Badge>
                    )}
                </div>

                {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                    </p>
                )}

                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                        ฿{Number(product.price).toLocaleString()}
                    </span>
                    {typeof product.remaining === 'number' && product.remaining > 0 && (
                        <span className="text-xs text-muted-foreground">
                            เหลือ {product.remaining} ชิ้น
                        </span>
                    )}
                </div>

                {product.optionsConfig && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        {(() => {
                            try {
                                const config = typeof product.optionsConfig === 'string'
                                    ? JSON.parse(product.optionsConfig)
                                    : product.optionsConfig
                                return config.options?.map((opt: any) => opt.name).join(', ')
                            } catch {
                                return null
                            }
                        })()}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full"
                    disabled={!product.isInStock}
                    onClick={handleAddToCart}
                    variant={added ? 'secondary' : 'default'}
                >
                    {added ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            เพิ่มแล้ว!
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {product.isInStock ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
