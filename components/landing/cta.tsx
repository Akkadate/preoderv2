import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTA() {
    return (
        <section className="py-24 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-blue-600" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="cta-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="2" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cta-pattern)" />
                </svg>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    พร้อมเริ่มต้นรับออเดอร์ 24 ชั่วโมงหรือยัง?
                </h2>
                <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
                    เริ่มใช้งานฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต ไม่มีข้อผูกมัด
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto px-8 py-6 text-lg bg-white text-violet-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                        >
                            เริ่มใช้งานฟรี
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </Link>
                    <Link href="mailto:support@preorder24.com">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                        >
                            ติดต่อทีมขาย
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                    <div>
                        <div className="text-3xl sm:text-4xl font-bold text-white">500+</div>
                        <div className="text-sm text-violet-200">ร้านค้าใช้งาน</div>
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-bold text-white">10K+</div>
                        <div className="text-sm text-violet-200">ออเดอร์/เดือน</div>
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-bold text-white">99%</div>
                        <div className="text-sm text-violet-200">ความพึงพอใจ</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
