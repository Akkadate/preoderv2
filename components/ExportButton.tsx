'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

interface ExportButtonProps {
    endpoint: string
    filename?: string
    label?: string
    variant?: 'default' | 'outline' | 'secondary'
    extraParams?: Record<string, string>
}

export function ExportButton({
    endpoint,
    filename = 'export.xlsx',
    label = 'Export Excel',
    variant = 'outline',
    extraParams = {}
}: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()

    const handleExport = async () => {
        try {
            setIsLoading(true)

            // Construct URL with current search params + extra params
            const params = new URLSearchParams(searchParams.toString())

            // Add extra params
            Object.entries(extraParams).forEach(([key, value]) => {
                if (value) params.set(key, value)
            })

            const url = `${endpoint}?${params.toString()}`

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Export failed')
            }

            // Get blob from response
            const blob = await response.blob()

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl

            // Use filename from header if available, else fallback
            const contentDisposition = response.headers.get('Content-Disposition')
            let finalFilename = filename
            if (contentDisposition) {
                const matches = /filename="?([^"]*)"?/.exec(contentDisposition)
                if (matches?.[1]) {
                    finalFilename = matches[1]
                }
            }

            link.download = finalFilename
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(downloadUrl)

            toast.success('ดาวน์โหลดไฟล์สำเร็จ')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={variant}
            onClick={handleExport}
            disabled={isLoading}
            className="gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {label}
        </Button>
    )
}
