'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
                <div className="text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </span>
                        ระบบพร้อมใช้งาน • เริ่มต้นฟรี
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                        รับออเดอร์ได้{' '}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                                24 ชั่วโมง
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#paint0_linear)" strokeWidth="3" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="paint0_linear" x1="2" y1="6" x2="298" y2="6">
                                        <stop stopColor="#7c3aed" />
                                        <stop offset="1" stopColor="#2563eb" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
                        ระบบจัดการออเดอร์สำหรับร้านรับหิ้ว ร้านขนม และร้านอาหาร
                        <br className="hidden sm:block" />
                        ไม่พลาดทุกคำสั่งซื้อ แม้คุณหลับไปแล้ว
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-400">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105"
                            >
                                เริ่มใช้งานฟรี
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto px-8 py-6 text-lg border-2 hover:bg-gray-50"
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            ดูวิธีการทำงาน
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 animate-fade-in-up animation-delay-600">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>ไม่ต้องใช้บัตรเครดิต</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>ตั้งค่าใน 5 นาที</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>ยกเลิกได้ทุกเมื่อ</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-16 lg:mt-24 relative animate-fade-in-up animation-delay-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="relative mx-auto max-w-5xl">
                        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden">
                            {/* Browser Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-white rounded-md px-3 py-1.5 text-sm text-gray-500 border border-gray-200">
                                        preorder24.com/admin/dashboard
                                    </div>
                                </div>
                            </div>
                            {/* Dashboard Content Preview */}
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-[300px] lg:min-h-[400px]">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1">ออเดอร์วันนี้</div>
                                        <div className="text-2xl font-bold text-gray-900">24</div>
                                        <div className="text-xs text-green-600 mt-1">↑ 12% จากเมื่อวาน</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1">รายได้วันนี้</div>
                                        <div className="text-2xl font-bold text-gray-900">฿8,450</div>
                                        <div className="text-xs text-green-600 mt-1">↑ 8% จากเมื่อวาน</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1">รอจัดส่ง</div>
                                        <div className="text-2xl font-bold text-gray-900">7</div>
                                        <div className="text-xs text-orange-600 mt-1">ต้องดำเนินการ</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="font-semibold text-gray-900">ออเดอร์ล่าสุด</div>
                                        <div className="text-sm text-violet-600 font-medium">ดูทั้งหมด →</div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'คุณสมชาย', items: 'โมจิไส้ครีม x3', amount: '฿450', status: 'ชำระแล้ว' },
                                            { name: 'คุณสมหญิง', items: 'เค้กช็อกโกแลต x1', amount: '฿380', status: 'รอชำระ' },
                                            { name: 'คุณวิชัย', items: 'ซูชิเซ็ต Premium x2', amount: '฿1,200', status: 'จัดส่งแล้ว' },
                                        ].map((order, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">{order.name}</div>
                                                    <div className="text-sm text-gray-500">{order.items}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">{order.amount}</div>
                                                    <div className={`text-xs ${order.status === 'ชำระแล้ว' ? 'text-green-600' : order.status === 'รอชำระ' ? 'text-orange-600' : 'text-blue-600'}`}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
