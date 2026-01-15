'use client'

export function BatchPrintButton({ count }: { count: number }) {
    return (
        <button
            onClick={() => window.print()}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
            🖨️ พิมพ์ทั้งหมด ({count} ใบ)
        </button>
    )
}
