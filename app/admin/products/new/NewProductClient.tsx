'use client'

import { ProductForm } from '../ProductForm'

export function NewProductClient({ shops }: { shops: any[] }) {
    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            throw new Error('Failed to create product')
        }
    }

    return (
        <ProductForm
            shops={shops}
            onSubmit={handleSubmit}
            title="เพิ่มสินค้าใหม่"
        />
    )
}
