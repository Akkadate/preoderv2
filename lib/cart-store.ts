import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    productId: string
    productName: string
    price: number
    quantity: number
    selectedOptions?: Record<string, string>
    shopId: string
    roundId: string
    image?: string
}

interface CartStore {
    items: CartItem[]
    shopId: string | null
    roundId: string | null

    // Actions
    addItem: (item: CartItem) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void

    // Computed
    getTotalItems: () => number
    getTotalPrice: () => number
    getItemsByRound: (roundId: string) => CartItem[]
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            shopId: null,
            roundId: null,

            addItem: (item: CartItem) => {
                const { items, shopId, roundId } = get()

                // Check if switching to different shop/round
                if (shopId && shopId !== item.shopId) {
                    // Clear cart when switching shops
                    set({ items: [item], shopId: item.shopId, roundId: item.roundId })
                    return
                }

                if (roundId && roundId !== item.roundId) {
                    // Clear cart when switching rounds
                    set({ items: [item], shopId: item.shopId, roundId: item.roundId })
                    return
                }

                // Check if item already exists
                const existingIndex = items.findIndex(
                    (i) => i.productId === item.productId &&
                        JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
                )

                if (existingIndex > -1) {
                    // Update quantity
                    const newItems = [...items]
                    newItems[existingIndex].quantity += item.quantity
                    set({ items: newItems })
                } else {
                    // Add new item
                    set({
                        items: [...items, item],
                        shopId: item.shopId,
                        roundId: item.roundId
                    })
                }
            },

            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                }))
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                }))
            },

            clearCart: () => {
                set({ items: [], shopId: null, roundId: null })
            },

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0)
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                )
            },

            getItemsByRound: (roundId: string) => {
                return get().items.filter((item) => item.roundId === roundId)
            },
        }),
        {
            name: 'merchant-cart',
        }
    )
)
