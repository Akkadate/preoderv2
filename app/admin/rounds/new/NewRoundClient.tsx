'use client'

import { RoundForm } from '../RoundForm'

export function NewRoundClient({ shops, defaultShopId }: { shops: any[], defaultShopId?: string }) {
    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/admin/rounds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to create round')
        }
    }

    return (
        <RoundForm
            shops={shops}
            onSubmit={handleSubmit}
            title="สร้างรอบขายใหม่"
            defaultShopId={defaultShopId}
        />
    )
}
