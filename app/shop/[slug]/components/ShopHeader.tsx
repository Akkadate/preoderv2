import { Shop } from '@prisma/client'
import { Store } from 'lucide-react'

interface ShopHeaderProps {
    shop: Shop
}

export default function ShopHeader({ shop }: ShopHeaderProps) {
    return (
        <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-4">
                    {shop.logo ? (
                        <img
                            src={shop.logo}
                            alt={shop.name}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Store className="h-8 w-8 text-primary" />
                        </div>
                    )}

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{shop.name}</h1>
                        {shop.description && (
                            <p className="mt-1 text-muted-foreground">{shop.description}</p>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
