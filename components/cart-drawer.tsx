'use client'

import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCartStore, CartItem } from '@/lib/cart-store'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CartDrawer() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { items, getTotalItems, getTotalPrice, updateQuantity, removeItem, clearCart } = useCartStore()

    // Prevent hydration mismatch by only showing cart data after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    const totalItems = mounted ? getTotalItems() : 0
    const totalPrice = mounted ? getTotalPrice() : 0

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {mounted && totalItems > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {totalItems}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        ตะกร้าสินค้า ({totalItems} รายการ)
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>ยังไม่มีสินค้าในตะกร้า</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-6">
                            {items.map((item) => (
                                <CartItemCard
                                    key={`${item.productId}-${JSON.stringify(item.selectedOptions)}`}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeItem}
                                />
                            ))}
                        </div>

                        <Separator />

                        <div className="py-4 space-y-4 px-6">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>รวมทั้งหมด</span>
                                <span>฿{totalPrice.toLocaleString()}</span>
                            </div>

                            <div className="space-y-2">
                                <Link href="/checkout" onClick={() => setOpen(false)} className="w-full block">
                                    <Button className="w-full" size="lg">
                                        ดำเนินการสั่งซื้อ
                                    </Button>
                                </Link>

                                <div className="h-4"></div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={clearCart}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    ล้างตะกร้า
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

interface CartItemCardProps {
    item: CartItem
    onUpdateQuantity: (productId: string, quantity: number) => void
    onRemove: (productId: string) => void
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
    return (
        <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
            {item.image && (
                <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.productName}</h4>

                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </p>
                )}

                <p className="text-sm font-semibold mt-1">
                    ฿{item.price.toLocaleString()} × {item.quantity}
                </p>
            </div>

            <div className="flex flex-col items-end gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemove(item.productId)}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-8 text-center text-sm">{item.quantity}</span>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
