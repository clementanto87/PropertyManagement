import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'clementanto1987@gmail.com'; // Using Paul Joseph as the test tenant

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'TENANT' }
    });

    console.log(`Updated user ${user.email} to role ${user.role}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
