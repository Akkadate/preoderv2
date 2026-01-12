'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    images: string[]
    isAvailable: boolean
    limitPerRound: number | null
    soldCount: number
    shop: {
        name: string
        slug: string
    }
    createdAt: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setProducts(products.filter(p => p.id !== id))
            } else {
                const error = await res.json()
                alert(error.error || 'ไม่สามารถลบสินค้าได้')
            }
        } catch (error) {
            console.error('Failed to delete product:', error)
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
                    <h1 className="text-2xl font-bold">สินค้า</h1>
                    <p className="text-muted-foreground">จัดการสินค้าทั้งหมดในระบบ</p>
                </div>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มสินค้า
                    </Button>
                </Link>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        รายการสินค้า ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">ยังไม่มีสินค้า</p>
                            <Link href="/admin/products/new">
                                <Button className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" />
                                    เพิ่มสินค้าแรก
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">รูป</TableHead>
                                    <TableHead>ชื่อสินค้า</TableHead>
                                    <TableHead>ร้านค้า</TableHead>
                                    <TableHead className="text-right">ราคา</TableHead>
                                    <TableHead className="text-center">สถานะ</TableHead>
                                    <TableHead className="text-center">ขายแล้ว</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                {product.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{product.shop.name}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ฿{product.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                                                {product.isAvailable ? 'พร้อมขาย' : 'ปิดการขาย'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {product.soldCount}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={deleting === product.id}
                                                        >
                                                            {deleting === product.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>ลบสินค้า?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                คุณต้องการลบ "{product.name}" หรือไม่?
                                                                {product.soldCount > 0 && (
                                                                    <span className="block mt-2 text-destructive">
                                                                        ⚠️ สินค้านี้มีประวัติการขาย {product.soldCount} รายการ
                                                                    </span>
                                                                )}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(product.id)}
                                                                className="bg-destructive text-destructive-foreground"
                                                            >
                                                                ลบสินค้า
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
