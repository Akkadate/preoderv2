'use client'

import { RoundForm } from '../../RoundForm'

export function EditRoundClient({ round, shops }: { round: any, shops: any[] }) {
    const handleSubmit = async (data: any) => {
        const res = await fetch(`/api/admin/rounds/${round.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to update round')
        }
    }

    return (
        <RoundForm
            initialData={round}
            shops={shops}
            onSubmit={handleSubmit}
            title="แก้ไขรอบขาย"
        />
    )
}
