'use client'

import { useState } from 'react'

const faqs = [
    {
        question: 'PreOrder24 เหมาะกับธุรกิจประเภทไหน?',
        answer: 'PreOrder24 เหมาะสำหรับร้านรับหิ้วสินค้าจากต่างประเทศ ร้านขนม เบเกอรี่ ร้านอาหาร หรือธุรกิจใดก็ตามที่ต้องการรับออเดอร์ล่วงหน้าและจัดการคำสั่งซื้ออย่างเป็นระบบ',
    },
    {
        question: 'ต้องมีความรู้ด้านเทคนิคไหม?',
        answer: 'ไม่จำเป็นเลยครับ ระบบถูกออกแบบมาให้ใช้งานง่าย แค่กรอกข้อมูล เพิ่มสินค้า ก็เริ่มรับออเดอร์ได้ทันที ถ้าติดปัญหาตรงไหน ทีมงานพร้อมช่วยเหลือ 24 ชม.',
    },
    {
        question: 'ลูกค้าจะชำระเงินอย่างไร?',
        answer: 'ระบบรองรับ PromptPay QR Code ลูกค้าแค่สแกนจ่าย แนบสลิป ระบบจะแจ้งเตือนคุณทันทีผ่าน Telegram ในอนาคตจะรองรับ Credit Card และช่องทางอื่นๆ เพิ่มเติม',
    },
    {
        question: 'มีค่าธรรมเนียมต่อรายการไหม?',
        answer: 'ไม่มีครับ! เราไม่เก็บค่าธรรมเนียมต่อออเดอร์หรือเปอร์เซ็นต์ยอดขาย คุณจ่ายแค่ค่าแพ็คเกจรายเดือนตามที่เลือก (ถ้าใช้แพ็คเกจฟรี ก็ฟรีตลอด)',
    },
    {
        question: 'ข้อมูลลูกค้าและออเดอร์ปลอดภัยไหม?',
        answer: 'ปลอดภัย 100% ครับ ข้อมูลทั้งหมดเข้ารหัสและเก็บบน Cloud Server ที่ได้มาตรฐานสากล มีการ backup ทุกวัน คุณสามารถ export ข้อมูลออกมาได้ทุกเมื่อ',
    },
    {
        question: 'สามารถยกเลิกได้ทุกเมื่อไหม?',
        answer: 'ได้ครับ ไม่มีสัญญาระยะยาว คุณสามารถยกเลิกหรือ downgrade แพ็คเกจได้ทุกเมื่อ และเรารับประกันคืนเงิน 30 วันหากไม่พอใจในบริการ',
    },
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section id="faq" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
                        คำถามที่พบบ่อย
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        มีคำถาม?{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            เรามีคำตอบ
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        หากไม่พบคำตอบที่ต้องการ สามารถติดต่อเราได้ตลอด 24 ชม.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl border transition-all duration-300 ${openIndex === index
                                    ? 'border-violet-200 shadow-lg shadow-violet-500/5'
                                    : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left"
                            >
                                <span className={`font-semibold ${openIndex === index ? 'text-violet-600' : 'text-gray-900'}`}>
                                    {faq.question}
                                </span>
                                <svg
                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-violet-600' : 'text-gray-400'
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
