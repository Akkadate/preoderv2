'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <button
            className="print-btn flex items-center justify-center gap-2"
            onClick={() => typeof window !== 'undefined' && window.print()}
        >
            <Printer className="h-4 w-4" />
            พิมพ์ใบปะหน้าพัสดุ
        </button>
    )
}
