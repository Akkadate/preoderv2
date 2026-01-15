'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Round {
    id: string
    name: string
    shop: {
        name: string
    }
}

interface RoundFilterProps {
    rounds: Round[]
}

export function RoundFilter({ rounds }: RoundFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentRoundId = searchParams.get('roundId') || 'all'

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value === 'all') {
            params.delete('roundId')
        } else {
            params.set('roundId', value)
        }

        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="w-full">
            <Select value={currentRoundId} onValueChange={handleValueChange}>
                <SelectTrigger>
                    <SelectValue placeholder="เลือกดูตามรอบ (ทั้งหมด)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">ดูทั้งหมด (ทุกรอบ)</SelectItem>
                    {rounds.map((round) => (
                        <SelectItem key={round.id} value={round.id}>
                            {round.shop.name} - {round.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
