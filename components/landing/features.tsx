const features = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'รับออเดอร์ 24 ชั่วโมง',
        description: 'ลูกค้าสั่งซื้อได้ตลอดเวลา ไม่ต้องคอยตอบแชท ระบบจัดการให้อัตโนมัติ',
        color: 'violet',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        title: 'รอบขายอัตโนมัติ',
        description: 'ตั้งเวลาเปิด-ปิดรอบได้ล่วงหน้า ระบบจะเปิด-ปิดให้เอง ไม่ต้องมานั่งกดเอง',
        color: 'blue',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        title: 'ชำระเงินง่าย',
        description: 'รองรับ PromptPay QR ลูกค้าจ่ายเงินและแนบสลิปได้เอง ตรวจสอบง่าย',
        color: 'emerald',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Dashboard ครบครัน',
        description: 'ดูยอดขาย จัดการออเดอร์ ติดตามรายได้ได้จากทุกที่ ทุกอุปกรณ์',
        color: 'orange',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        title: 'แจ้งเตือนทันที',
        description: 'รับ notification ผ่าน Telegram เมื่อมีออเดอร์ใหม่ หรือลูกค้าแนบสลิป',
        color: 'pink',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
        ),
        title: 'Export & Print',
        description: 'ส่งออกรายการซื้อเป็นรูปภาพ พิมพ์ใบปะหน้าพัสดุได้ง่ายๆ',
        color: 'cyan',
    },
]

const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
}

export function Features() {
    return (
        <section id="features" className="py-24 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
                        ฟีเจอร์
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        ทุกสิ่งที่คุณต้องการ
                        <br />
                        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            ในที่เดียว
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        ครบทุกฟังก์ชันสำหรับจัดการร้านค้าออนไลน์ ตั้งแต่รับออเดอร์ ไปจนถึงจัดส่ง
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => {
                        const colors = colorStyles[feature.color]
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
                            >
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} ${colors.text} mb-5`}>
                                    {feature.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
