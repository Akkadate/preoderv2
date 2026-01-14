'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface CopyOrderUrlButtonProps {
    orderId: string
}

export function CopyOrderUrlButton({ orderId }: CopyOrderUrlButtonProps) {
    const [copied, setCopied] = useState(false)
    const [showToast, setShowToast] = useState(false)

    const handleCopy = async () => {
        const url = `${window.location.origin}/orders/${orderId}`

        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setShowToast(true)

            // Reset states after 2 seconds
            setTimeout(() => {
                setCopied(false)
                setShowToast(false)
            }, 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1"
            >
                {copied ? (
                    <>
                        <Check className="h-3 w-3 text-green-500" />
                        คัดลอกแล้ว
                    </>
                ) : (
                    <>
                        <Copy className="h-3 w-3" />
                        คัดลอก URL
                    </>
                )}
            </Button>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    คัดลอก URL สำหรับลูกค้าแล้ว
                </div>
            )}
        </>
    )
}
