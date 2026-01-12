'use client'

import { ProductForm } from '../../ProductForm'

export function EditProductClient({ product, shops }: { product: any, shops: any[] }) {
    const handleSubmit = async (data: any) => {
        const res = await fetch(`/api/admin/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            throw new Error('Failed to update product')
        }
    }

    return (
        <ProductForm
            initialData={product}
            shops={shops}
            onSubmit={handleSubmit}
            title="แก้ไขสินค้า"
        />
    )
}
