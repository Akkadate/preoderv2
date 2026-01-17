const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDemoUsers() {
    const result = await prisma.user.updateMany({
        where: {
            email: {
                in: ['owner@japan-preorder.com', 'owner@mom-cooking.com']
            }
        },
        data: {
            emailVerified: new Date()
        }
    })

    console.log(`Updated ${result.count} users`)
    await prisma.$disconnect()
    process.exit(0)
}

verifyDemoUsers()
