import { PrismaClient, ShopType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clear existing data (for development)
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.product.deleteMany()
    await prisma.round.deleteMany()
    await prisma.shop.deleteMany()
    await prisma.user.deleteMany()

    console.log('🗑️  Cleared existing data')

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('demo123', 10)

    // Create demo users (Shop Owners)
    const owner1 = await prisma.user.create({
        data: {
            email: 'owner@japan-preorder.com',
            name: 'Akira Tanaka',
            password: hashedPassword,
        },
    })

    const owner2 = await prisma.user.create({
        data: {
            email: 'owner@mom-cooking.com',
            name: 'Mama Som',
            password: hashedPassword,
        },
    })

    console.log('✅ Created users (password: demo123)')

    // ============================================
    // SHOP A: BUYING_AGENT (Pre-order from Japan)
    // ============================================
    const japanShop = await prisma.shop.create({
        data: {
            name: 'Japan Pre-order',
            slug: 'japan-preorder',
            description: 'รับหิ้วสินค้าจากญี่ปุ่นทุกรอบบิน ของแท้ 100% ราคาดี',
            type: ShopType.BUYING_AGENT,
            logo: '/logos/japan-shop.png',
            isActive: true,
            bankInfo: {
                bankName: 'ธนาคารกสิกรไทย',
                accNo: '123-4-56789-0',
                accName: 'Akira Tanaka',
            },
            shippingRates: {
                type: 'weight',
                rates: [
                    { maxWeight: 500, price: 50 },
                    { maxWeight: 1000, price: 80 },
                    { maxWeight: 2000, price: 120 },
                ],
            },
            ownerId: owner1.id,
        },
    })

    // Create active round for Japan Shop (7 days from now)
    const now = new Date()
    const nextWeek = new Date(now)
    nextWeek.setDate(now.getDate() + 7)
    const twoWeeksLater = new Date(now)
    twoWeeksLater.setDate(now.getDate() + 14)

    const japanRound = await prisma.round.create({
        data: {
            name: 'รอบบินญี่ปุ่น มกราคม 2026',
            opensAt: now,
            closesAt: nextWeek,
            shippingStart: twoWeeksLater,
            status: 'OPEN',
            shopId: japanShop.id,
        },
    })

    // Create products for Japan Shop
    await prisma.product.createMany({
        data: [
            {
                name: 'Pocky Matcha ชาเขียวพรีเมี่ยม',
                description: 'ขนมโพกกี้รสชาเขียวแท้จากญี่ปุ่น กล่องใหญ่ 10 แท่ง',
                price: 189.0,
                images: ['/products/pocky-matcha.jpg'],
                shopId: japanShop.id,
                isAvailable: true,
                limitPerRound: 50,
                optionsConfig: {
                    options: [
                        {
                            name: 'ปริมาณ',
                            choices: ['1 กล่อง', '3 กล่อง (ลด 10%)', '5 กล่อง (ลด 15%)'],
                        },
                    ],
                },
            },
            {
                name: 'Shiseido Senka Perfect Whip',
                description: 'โฟมล้างหน้าเซนกะ ยอดนิยมอันดับ 1 ในญี่ปุ่น',
                price: 350.0,
                images: ['/products/senka-whip.jpg'],
                shopId: japanShop.id,
                isAvailable: true,
                limitPerRound: 30,
                optionsConfig: {
                    options: [
                        {
                            name: 'ขนาด',
                            choices: ['120g (ปกติ)', '150g (ขนาดใหญ่)'],
                        },
                    ],
                },
            },
            {
                name: 'Onitsuka Tiger Mexico 66',
                description: 'รองเท้าสนีกเกอร์คลาสสิกแท้จากญี่ปุ่น',
                price: 2890.0,
                images: ['/products/onitsuka-tiger.jpg'],
                shopId: japanShop.id,
                isAvailable: true,
                limitPerRound: 10,
                optionsConfig: {
                    options: [
                        {
                            name: 'Size',
                            choices: ['US 7', 'US 8', 'US 9', 'US 10'],
                        },
                        {
                            name: 'Color',
                            choices: ['White/Blue', 'Yellow/Black', 'Black/White'],
                        },
                    ],
                },
            },
        ],
    })

    console.log('✅ Created Japan Pre-order Shop with products')

    // ============================================
    // SHOP B: KITCHEN (Daily Menu)
    // ============================================
    const momKitchen = await prisma.shop.create({
        data: {
            name: 'Mom Cooking',
            slug: 'mom-cooking',
            description: 'อาหารทำสดใหม่ทุกวัน อร่อยเหมือนแม่ทำ สั่งก่อน 10:00 น. รับได้เที่ยง',
            type: ShopType.KITCHEN,
            logo: '/logos/mom-kitchen.png',
            isActive: true,
            bankInfo: {
                bankName: 'ธนาคารไทยพาณิชย์',
                accNo: '987-6-54321-0',
                accName: 'Mama Som',
            },
            shippingRates: {
                type: 'distance',
                basePrice: 30,
                perKm: 10,
                freeShippingOver: 200,
            },
            ownerId: owner2.id,
        },
    })

    // Create round for tomorrow (Kitchen)
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const tomorrowCutoff = new Date(tomorrow)
    tomorrowCutoff.setHours(10, 0, 0, 0)
    const tomorrowPickup = new Date(tomorrow)
    tomorrowPickup.setHours(12, 0, 0, 0)

    const kitchenRound = await prisma.round.create({
        data: {
            name: 'เมนูวันพรุ่งนี้ ' + tomorrow.toLocaleDateString('th-TH'),
            opensAt: now,
            closesAt: tomorrowCutoff,
            pickupDate: tomorrowPickup,
            status: 'OPEN',
            shopId: momKitchen.id,
        },
    })

    // Create products for Kitchen
    await prisma.product.createMany({
        data: [
            {
                name: 'แกงเขียวหวานไก่',
                description: 'แกงเขียวหวานไก่สูตรต้นตำรับ เครื่องแกงบดสด พริกแกงเข้มข้น',
                price: 55.0,
                images: ['/products/green-curry.jpg'],
                shopId: momKitchen.id,
                isAvailable: true,
                limitPerRound: 30,
                optionsConfig: {
                    options: [
                        {
                            name: 'ระดับความเผ็ด',
                            choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'],
                        },
                    ],
                },
            },
            {
                name: 'ข้าวหอมมะลิ',
                description: 'ข้าวหอมมะลิหุงสด ร้อนๆ',
                price: 10.0,
                images: ['/products/rice.jpg'],
                shopId: momKitchen.id,
                isAvailable: true,
                limitPerRound: 100,
                optionsConfig: {
                    options: [
                        {
                            name: 'ปริมาณ',
                            choices: ['ถ้วยเล็ก', 'ถ้วยกลาง', 'ถ้วยใหญ่'],
                        },
                    ],
                },
            },
            {
                name: 'น้ำมะนาวโซดา',
                description: 'น้ำมะนาวโซดาสดชื่น มะนาวบีบสด',
                price: 25.0,
                images: ['/products/lemon-soda.jpg'],
                shopId: momKitchen.id,
                isAvailable: true,
                limitPerRound: 50,
                optionsConfig: {
                    options: [
                        {
                            name: 'ความหวาน',
                            choices: ['0%', '25%', '50%', '75%', '100%'],
                        },
                        {
                            name: 'น้ำแข็ง',
                            choices: ['ไม่ใส่', 'น้อย', 'ปกติ', 'เยอะ'],
                        },
                    ],
                },
            },
        ],
    })

    console.log('✅ Created Mom Cooking Shop with products')

    // Create some demo customers
    await prisma.customer.createMany({
        data: [
            {
                name: 'ลูกค้า A',
                contactInfo: '@line_customer_a',
                address: '123 ถ.สุขุมวิท กรุงเทพฯ',
                shopId: japanShop.id,
            },
            {
                name: 'ลูกค้า B',
                contactInfo: '081-234-5678',
                address: '456 ถ.พระราม 4 กรุงเทพฯ',
                shopId: momKitchen.id,
            },
        ],
    })

    console.log('✅ Created demo customers')

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - 2 Users (Shop Owners)')
    console.log('   - 2 Shops (1 BUYING_AGENT, 1 KITCHEN)')
    console.log('   - 2 Active Rounds')
    console.log('   - 6 Products (3 per shop)')
    console.log('   - 2 Customers')
    console.log('\n🔗 Access URLs:')
    console.log('   - Japan Pre-order: http://localhost:3000/shop/japan-preorder')
    console.log('   - Mom Cooking: http://localhost:3000/shop/mom-cooking')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
