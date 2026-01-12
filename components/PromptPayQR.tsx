'use client'

import generatePayload from 'promptpay-qr'
import { useMemo } from 'react'

interface PromptPayQRProps {
    mobileNumber?: string
    amount?: number
    size?: number
}

export function PromptPayQR({ mobileNumber, amount, size = 200 }: PromptPayQRProps) {
    const qrCodeUrl = useMemo(() => {
        if (!mobileNumber) return null

        try {
            // Generate PromptPay payload
            const payload = generatePayload(mobileNumber, { amount })

            // Use QR code API to generate image
            const encodedPayload = encodeURIComponent(payload)
            return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedPayload}`
        } catch (error) {
            console.error('Error generating QR:', error)
            return null
        }
    }, [mobileNumber, amount, size])

    if (!mobileNumber) {
        return (
            <div className="flex items-center justify-center bg-muted rounded-lg p-8 text-muted-foreground">
                ยังไม่ได้ตั้งค่าเลข PromptPay
            </div>
        )
    }

    if (!qrCodeUrl) {
        return (
            <div className="flex items-center justify-center bg-destructive/10 rounded-lg p-8 text-destructive">
                ไม่สามารถสร้าง QR Code ได้
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <img
                src={qrCodeUrl}
                alt="PromptPay QR Code"
                width={size}
                height={size}
                className="rounded-lg border bg-white p-2"
            />
            <div className="text-center text-sm text-muted-foreground">
                <p>PromptPay: {mobileNumber}</p>
                {amount && <p className="font-semibold text-foreground">฿{amount.toLocaleString()}</p>}
            </div>
        </div>
    )
}
