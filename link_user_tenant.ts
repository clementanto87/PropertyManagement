import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkUserToTenant() {
    const email = 'clement.anto@gmail.com';

    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
        where: { email }
    });

    console.log('User:', {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        tenantId: user?.tenantId
    });

    console.log('\nTenant:', {
        id: tenant?.id,
        name: tenant?.name,
        email: tenant?.email
    });

    if (user && tenant && !user.tenantId) {
        console.log('\n🔧 Linking user to tenant...');
        await prisma.user.update({
            where: { id: user.id },
            data: { tenantId: tenant.id }
        });
        console.log('✅ User linked to tenant!');
    } else if (user?.tenantId) {
        console.log('\n✅ User already linked to tenant');
    }

    // Check lease
    if (tenant) {
        const lease = await prisma.lease.findFirst({
            where: { tenantId: tenant.id },
            include: {
                unit: {
                    include: { property: true }
                }
            }
        });

        if (lease) {
            console.log('\nLease Info:');
            console.log('  Property:', lease.unit.property.name);
            console.log('  Unit:', lease.unit.unitNumber);
            console.log('  Rent: $' + lease.rentAmount);
            console.log('\n🚀 All set! Try logging in with OTP now.');
        } else {
            console.log('\n⚠️  No lease found for this tenant');
        }
    }

    await prisma.$disconnect();
}

linkUserToTenant();
