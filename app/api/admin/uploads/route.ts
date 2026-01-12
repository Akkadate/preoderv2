import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Product image upload handler
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${crypto.randomUUID()}${path.extname(file.name)}`

        // Save to public/uploads/products
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')

        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore error if directory exists
        }

        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return the public URL
        const imageUrl = `/uploads/products/${filename}`

        return NextResponse.json({ url: imageUrl })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
}
