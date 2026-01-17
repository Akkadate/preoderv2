import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const slug = searchParams.get('slug')

        if (!slug) {
            return NextResponse.json(
                { error: 'กรุณาระบุ slug' },
                { status: 400 }
            )
        }

        // Check if slug exists
        const existingShop = await prisma.shop.findUnique({
            where: { slug },
        })

        return NextResponse.json({
            slug,
            available: !existingShop,
        })
    } catch (error) {
        console.error('Slug check error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด' },
            { status: 500 }
        )
    }
}
