'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Calendar, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Round {
    id: string
    name: string
    opensAt: string
    closesAt: string
    status: string
    shop: {
        id: string
        name: string
        slug: string
        type: string
    }
    _count: {
        orders: number
    }
}

const statusConfig: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive', icon: any }> = {
    OPEN: { label: 'เปิดรับ', variant: 'default', icon: CheckCircle },
    CLOSED: { label: 'ปิดแล้ว', variant: 'secondary', icon: XCircle },
    FULFILLED: { label: 'จัดส่งครบ', variant: 'secondary', icon: CheckCircle },
}

export default function RoundsPage() {
    const [rounds, setRounds] = useState<Round[]>([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        fetchRounds()
    }, [])

    const fetchRounds = async () => {
        try {
            const res = await fetch('/api/admin/rounds')
            if (res.ok) {
                const data = await res.json()
                setRounds(data)
            }
        } catch (error) {
            console.error('Failed to fetch rounds:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = async (round: Round) => {
        const newStatus = round.status === 'OPEN' ? 'CLOSED' : 'OPEN'
        setToggling(round.id)
        try {
            const res = await fetch(`/api/admin/rounds/${round.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                setRounds(rounds.map(r =>
                    r.id === round.id ? { ...r, status: newStatus } : r
                ))
            }
        } catch (error) {
            console.error('Failed to toggle status:', error)
        } finally {
            setToggling(null)
        }
    }

    const handleDelete = async (id: string) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/rounds/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setRounds(rounds.filter(r => r.id !== id))
            } else {
                const error = await res.json()
                alert(error.error || 'ไม่สามารถลบรอบได้')
            }
        } catch (error) {
            console.error('Failed to delete round:', error)
            alert('เกิดข้อผิดพลาด')
        } finally {
            setDeleting(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">รอบการขาย</h1>
                    <p className="text-muted-foreground">จัดการรอบการขายทั้งหมด</p>
                </div>
                <Link href="/admin/rounds/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        สร้างรอบใหม่
                    </Button>
                </Link>
            </div>

            {/* Rounds Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rounds.map((round) => {
                    const config = statusConfig[round.status] || statusConfig.CLOSED
                    const StatusIcon = config.icon
                    const isOpen = round.status === 'OPEN'
                    const isPast = new Date(round.closesAt) < new Date()

                    return (
                        <Card key={round.id} className={`${isOpen ? 'border-primary' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{round.name}</CardTitle>
                                    <Badge variant={config.variant}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {config.label}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline">{round.shop.name}</Badge>
                                    <Badge variant="outline">{round.shop.type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> เปิดรับ
                                        </span>
                                        <span>{new Date(round.opensAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`flex items-center gap-1 ${isPast ? 'text-destructive' : 'text-muted-foreground'}`}>
                                            <Calendar className="h-3 w-3" /> ปิดรับ
                                        </span>
                                        <span className={isPast ? 'text-destructive font-medium' : ''}>
                                            {new Date(round.closesAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-2 border-t">
                                        <span>คำสั่งซื้อ</span>
                                        <span>{round._count.orders}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        variant={isOpen ? 'destructive' : 'default'}
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => toggleStatus(round)}
                                        disabled={toggling === round.id}
                                    >
                                        {toggling === round.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isOpen ? (
                                            <>ปิดรับ</>
                                        ) : (
                                            <>เปิดรับ</>
                                        )}
                                    </Button>
                                    <Link href={`/admin/rounds/${round.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={deleting === round.id || round._count.orders > 0}
                                            >
                                                {deleting === round.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>ลบรอบ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    คุณต้องการลบรอบ "{round.name}" หรือไม่?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(round.id)}
                                                    className="bg-destructive text-destructive-foreground"
                                                >
                                                    ลบรอบ
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {rounds.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">ยังไม่มีรอบการขาย</p>
                        <Link href="/admin/rounds/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                สร้างรอบแรก
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
