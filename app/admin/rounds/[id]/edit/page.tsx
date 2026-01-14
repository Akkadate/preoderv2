import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { EditRoundClient } from './EditRoundClient'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getRound(id: string) {
    const round = await prisma.round.findUnique({
        where: { id }
    })
    return round
}

async function getShops() {
    const session = await auth()
    if (!session?.user?.email) {
        return []
    }

    return await prisma.shop.findMany({
        where: { owner: { email: session.user.email } },
        select: { id: true, name: true }
    })
}

export default async function EditRoundPage({ params }: PageProps) {
    const { id } = await params
    const [round, shops] = await Promise.all([
        getRound(id),
        getShops()
    ])

    if (!round) {
        notFound()
    }

    // Transform dates to ISO strings for client component
    const serializedRound = {
        ...round,
        opensAt: round.opensAt.toISOString(),
        closesAt: round.closesAt.toISOString(),
        shippingStart: round.shippingStart?.toISOString() || null,
        pickupDate: round.pickupDate?.toISOString() || null,
    }

    return <EditRoundClient round={serializedRound} shops={shops} />
}
