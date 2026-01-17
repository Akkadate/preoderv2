'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, AlertTriangle, FileText, Lock, Loader2 } from 'lucide-react'

const termsContent = `
ข้อตกลงและเงื่อนไขการใช้บริการ PreOrder24
วันที่มีผลบังคับใช้: 1 มกราคม 2567

โปรดอ่านข้อตกลงและเงื่อนไขการใช้บริการนี้อย่างละเอียดก่อนใช้งาน

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ความรับผิดชอบของผู้ใช้บริการ

1.1 ท่านตกลงที่จะใช้บริการ PreOrder24 เพื่อวัตถุประสงค์ที่ถูกต้องตามกฎหมายเท่านั้น

1.2 ท่านเป็นผู้รับผิดชอบแต่เพียงผู้เดียวสำหรับสินค้าและบริการที่ท่านจำหน่ายผ่านแพลตฟอร์ม

1.3 ท่านต้องมีใบอนุญาตหรือเอกสารที่จำเป็นสำหรับการประกอบกิจการร้านค้า (ถ้ากฏหมายกำหนด)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. สินค้าต้องห้าม

ท่านตกลงที่จะไม่จำหน่ายสินค้าดังต่อไปนี้ผ่านแพลตฟอร์ม:

• สินค้าผิดกฎหมายทุกประเภท รวมถึงยาเสพติด อาวุธ
• สินค้าปลอม สินค้าละเมิดลิขสิทธิ์ หรือเครื่องหมายการค้า
• สินค้าลักลอบหรือหนีภาษี
• สินค้าที่ไม่ผ่านมาตรฐาน อย. (สำหรับอาหารและเครื่องสำอาง)
• สินค้าที่ขัดต่อศีลธรรมอันดีของสังคม
• สินค้าที่กฎหมายห้ามจำหน่าย

การฝ่าฝืนข้อห้ามดังกล่าว PreOrder24 สงวนสิทธิ์ในการระงับบัญชีโดยทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. ข้อจำกัดความรับผิด

3.1 PreOrder24 เป็นเพียงผู้ให้บริการแพลตฟอร์มสำหรับจัดการออเดอร์เท่านั้น ไม่มีส่วนเกี่ยวข้องกับการจำหน่ายสินค้าระหว่างท่านกับลูกค้าของท่าน

3.2 PreOrder24 ไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจาก:
   • ความผิดพลาดของสินค้าหรือบริการที่ท่านจำหน่าย
   • ข้อพิพาทระหว่างท่านกับลูกค้า
   • การสูญหายของรายได้หรือกำไร
   • การหยุดชะงักของระบบที่อยู่นอกเหนือการควบคุม
   • ความเสียหายอันเกิดจากการถูกโจมตีทางไซเบอร์

3.3 ในทุกกรณี ความรับผิดสูงสุดของ PreOrder24 จะไม่เกินจำนวนค่าบริการที่ท่านชำระในช่วง 12 เดือนที่ผ่านมา

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)

4.1 PreOrder24 ปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562

4.2 เราเก็บรวบรวมข้อมูลเท่าที่จำเป็นสำหรับการให้บริการ ได้แก่:
   • ข้อมูลติดต่อ (อีเมล ชื่อ)
   • ข้อมูลร้านค้าและธุรกรรม
   • ข้อมูลการใช้งานระบบ

4.3 ท่านมีสิทธิ์ในการขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่าน

4.4 ท่านตกลงที่จะปฏิบัติตาม PDPA ในการจัดเก็บข้อมูลลูกค้าของท่านที่ใช้ผ่านแพลตฟอร์ม

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. การระงับและยกเลิกบัญชี

5.1 ท่านสามารถยกเลิกบัญชีได้ตลอดเวลาโดยติดต่อทีมงาน

5.2 PreOrder24 สงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีหากพบว่า:
   • มีการละเมิดข้อตกลงนี้
   • มีการใช้งานที่ผิดปกติหรือส่อเจตนาทุจริต
   • มีคำสั่งจากหน่วยงานราชการ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. การเปลี่ยนแปลงข้อตกลง

PreOrder24 อาจแก้ไขข้อตกลงนี้ได้ตลอดเวลา การใช้บริการต่อหลังจากมีการแก้ไขถือว่าท่านยอมรับข้อตกลงใหม่

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. กฎหมายที่ใช้บังคับ

ข้อตกลงนี้อยู่ภายใต้กฎหมายของราชอาณาจักรไทย

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

การกดปุ่ม "ยอมรับและดำเนินการต่อ" ถือว่าท่านได้อ่าน เข้าใจ และยินยอมปฏิบัติตามข้อตกลงทั้งหมดข้างต้น
`

function TermsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(false)

    // รับข้อมูลจาก registration form
    const name = searchParams.get('name') || ''
    const email = searchParams.get('email') || ''
    const password = searchParams.get('password') || ''

    const handleAccept = async () => {
        if (!accepted) return

        setLoading(true)

        try {
            // ส่งข้อมูลไป register
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    acceptedTerms: true,
                    acceptedTermsAt: new Date().toISOString(),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'เกิดข้อผิดพลาด')
                setLoading(false)
                return
            }

            // ไปหน้ารอยืนยันอีเมล
            router.push(`/verification-pending?email=${encodeURIComponent(email)}`)
        } catch (error) {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">24</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">ข้อตกลงและเงื่อนไขการใช้บริการ</h1>
                    <p className="text-gray-600 mt-2">กรุณาอ่านและยอมรับข้อตกลงก่อนดำเนินการต่อ</p>
                </div>

                {/* Key Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">สินค้าต้องห้าม</h3>
                            <p className="text-sm text-gray-600">ห้ามจำหน่ายสินค้าผิดกฎหมาย สินค้าปลอม หรือสินค้าต้องห้ามทุกประเภท</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">ข้อจำกัดความรับผิด</h3>
                            <p className="text-sm text-gray-600">PreOrder24 ไม่รับผิดชอบต่อความเสียหายจากการใช้งาน</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">PDPA</h3>
                            <p className="text-sm text-gray-600">เราปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">ความรับผิดชอบ</h3>
                            <p className="text-sm text-gray-600">ท่านรับผิดชอบสินค้าและบริการที่จำหน่ายแต่เพียงผู้เดียว</p>
                        </div>
                    </div>
                </div>

                {/* Full Terms */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">ข้อตกลงฉบับเต็ม</CardTitle>
                        <CardDescription>กรุณาอ่านอย่างละเอียด</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] rounded-lg border bg-gray-50 p-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                                {termsContent}
                            </pre>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Accept Section */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-6">
                            <Checkbox
                                id="accept-terms"
                                checked={accepted}
                                onCheckedChange={(checked) => setAccepted(checked === true)}
                            />
                            <label
                                htmlFor="accept-terms"
                                className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                            >
                                ข้าพเจ้าได้อ่าน เข้าใจ และยินยอมปฏิบัติตามข้อตกลงและเงื่อนไขการใช้บริการ
                                รวมถึงนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) ทั้งหมดข้างต้น
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                ย้อนกลับ
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                                disabled={!accepted || loading}
                                onClick={handleAccept}
                            >
                                {loading ? 'กำลังดำเนินการ...' : 'ยอมรับและดำเนินการต่อ'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
                <p className="text-gray-600">กำลังโหลด...</p>
            </div>
        </div>
    )
}

export default function TermsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <TermsContent />
        </Suspense>
    )
}
