'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const statusLabels: Record<string, string> = {
    all: 'ทุกสถานะ',
    PENDING: 'รอชำระเงิน',
    PAID_WAITING: 'รอยืนยัน',
    CONFIRMED: 'ยืนยันแล้ว',
    SHIPPED: 'กำลังจัดส่ง',
    COMPLETED: 'สำเร็จ',
    CANCELLED: 'ยกเลิก',
}

export function StatusFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentStatus = searchParams.get('status') || 'all'

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value === 'all') {
            params.delete('status')
        } else {
            params.set('status', value)
        }

        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Select value={currentStatus} onValueChange={handleValueChange}>
            <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
