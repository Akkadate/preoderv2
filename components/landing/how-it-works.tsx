const steps = [
    {
        step: '01',
        title: 'สมัครและตั้งค่าร้าน',
        description: 'สมัครฟรี ใส่ข้อมูลร้าน เพิ่มสินค้า และตั้งค่าการชำระเงิน ใช้เวลาไม่ถึง 10 นาที',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        step: '02',
        title: 'แชร์ลิงก์ให้ลูกค้า',
        description: 'คัดลอกลิงก์ร้านของคุณ แชร์ให้ลูกค้าผ่าน Line, Facebook หรือช่องทางใดก็ได้',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
        ),
    },
    {
        step: '03',
        title: 'รับออเดอร์และเงิน',
        description: 'ลูกค้าสั่งซื้อและจ่ายเงินผ่านระบบ คุณได้รับแจ้งเตือนและจัดการออเดอร์ได้ทันที',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                        เริ่มต้นง่าย
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        เริ่มใช้งานใน{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            3 ขั้นตอน
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        ไม่ต้องมีความรู้ด้านเทคนิค ทุกคนสามารถเริ่มต้นได้ทันที
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-blue-200 to-emerald-200 -translate-y-1/2" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                {/* Card */}
                                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    {/* Step Number */}
                                    <div className="absolute -top-4 left-8">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold shadow-lg">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center text-violet-600 mb-6 mt-2">
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Arrow for mobile */}
                                {index < steps.length - 1 && (
                                    <div className="flex justify-center my-4 lg:hidden">
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
