import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
    {
        name: 'Free',
        description: 'เริ่มต้นสำหรับลองใช้งาน',
        price: 'ฟรี',
        period: 'ตลอดไป',
        features: [
            'ร้านค้า 1 ร้าน',
            'สินค้าไม่จำกัด',
            'รอบขาย 10 รอบ/เดือน',
            'ออเดอร์ 50 รายการ/เดือน',
            'Dashboard พื้นฐาน',
            'แจ้งเตือน Telegram',
        ],
        limitations: [
            'มี watermark',
        ],
        cta: 'เริ่มใช้งานฟรี',
        popular: false,
        gradient: false,
    },
    {
        name: 'Pro',
        description: 'สำหรับร้านขนาดเล็ก-กลาง',
        price: '฿299',
        period: '/เดือน',
        features: [
            'ร้านค้า 1 ร้าน',
            'สินค้าไม่จำกัด',
            'รอบขายไม่จำกัด',
            'ออเดอร์ไม่จำกัด',
            'Dashboard + Analytics',
            'แจ้งเตือน Telegram',
            'Export รายการ + ใบปะหน้า',
            'ไม่มี watermark',
            'Priority Support',
        ],
        limitations: [],
        cta: 'เริ่มทดลองใช้ 14 วัน',
        popular: true,
        gradient: true,
    },
    {
        name: 'Enterprise',
        description: 'สำหรับธุรกิจขนาดใหญ่',
        price: 'ติดต่อ',
        period: 'เรา',
        features: [
            'หลายร้านค้า / สาขา',
            'ทุกอย่างใน Pro',
            'Custom Domain',
            'API Access',
            'ระบบ Multi-user',
            'รายงานขั้นสูง',
            'Dedicated Support',
            'SLA 99.9%',
        ],
        limitations: [],
        cta: 'ติดต่อทีมขาย',
        popular: false,
        gradient: false,
    },
]

export function Pricing() {
    return (
        <section id="pricing" className="py-24 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
                        ราคา
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        เลือกแพ็คเกจที่{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            เหมาะกับคุณ
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        เริ่มต้นฟรี ไม่ต้องใช้บัตรเครดิต อัพเกรดได้ทุกเมื่อ
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-8 ${plan.popular
                                ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-xl shadow-violet-500/25 scale-105 z-10'
                                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                } transition-all duration-300`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                                        แนะนำ
                                    </div>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-6">
                                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm ${plan.popular ? 'text-violet-100' : 'text-gray-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-sm ${plan.popular ? 'text-violet-100' : 'text-gray-500'}`}>
                                    {plan.period}
                                </span>
                            </div>

                            {/* CTA */}
                            <Link href="/register" className="block mb-8">
                                <Button
                                    size="lg"
                                    className={`w-full ${plan.popular
                                        ? 'bg-white text-violet-600 hover:bg-gray-100'
                                        : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700'
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>

                            {/* Features */}
                            <ul className="space-y-3">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start gap-3">
                                        <svg
                                            className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-violet-200' : 'text-emerald-500'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-600'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                                {plan.limitations.map((limitation, limitationIndex) => (
                                    <li key={limitationIndex} className="flex items-start gap-3">
                                        <svg
                                            className="w-5 h-5 flex-shrink-0 text-gray-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm text-gray-400">
                                            {limitation}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Money Back Guarantee */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>รับประกันคืนเงิน 30 วัน หากไม่พอใจ</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
