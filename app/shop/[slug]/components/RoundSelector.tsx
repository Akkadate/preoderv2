'use client'

import { Round, ShopType } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RoundSelectorProps {
    rounds: Round[]
    activeRound?: Round
    shopType: ShopType
}

function formatTimeRemaining(closesAt: Date): string {
    const now = new Date()
    const diff = closesAt.getTime() - now.getTime()

    if (diff <= 0) return 'Closed'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h ${minutes}m remaining`
}

export default function RoundSelector({
    rounds,
    activeRound,
    shopType,
}: RoundSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [timeRemaining, setTimeRemaining] = useState('')

    useEffect(() => {
        if (!activeRound) return

        const updateTimer = () => {
            setTimeRemaining(formatTimeRemaining(new Date(activeRound.closesAt)))
        }

        updateTimer()
        const interval = setInterval(updateTimer, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [activeRound])

    if (!activeRound) return null

    return (
        <div className="border-b bg-muted/30">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {shopType === 'KITCHEN' ? (
                            <>
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{activeRound.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ปิดรับออเดอร์: {new Date(activeRound.closesAt).toLocaleString('th-TH')}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{activeRound.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ส่งของ: {activeRound.shippingStart ? new Date(activeRound.shippingStart).toLocaleDateString('th-TH') : 'TBD'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <Badge variant={timeRemaining.includes('Closed') ? 'destructive' : 'default'}>
                        {timeRemaining}
                    </Badge>
                </div>

                {rounds.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {rounds.map((round) => (
                            <Button
                                key={round.id}
                                variant={activeRound?.id === round.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams)
                                    newParams.set('roundId', round.id)
                                    router.push(`?${newParams.toString()}`)
                                }}
                            >
                                {round.name}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
