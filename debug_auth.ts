import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAuth() {
    const email = 'clement.anto@gmail.com';

    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    console.log('\n=== USER DEBUG INFO ===');
    console.log('Email:', user?.email);
    console.log('Role:', user?.role);
    console.log('Role Type:', typeof user?.role);
    console.log('Is TENANT?:', user?.role === 'TENANT');
    console.log('TenantId:', user?.tenantId);
    console.log('Has Tenant Object?:', !!user?.tenant);

    if (user?.tenant) {
        console.log('\n=== TENANT INFO ===');
        console.log('Tenant ID:', user.tenant.id);
        console.log('Tenant Name:', user.tenant.name);
        console.log('Tenant Email:', user.tenant.email);
    }

    console.log('\n=== OTP INFO ===');
    console.log('Has OTP Code?:', !!user?.otpCode);
    console.log('OTP Expires At:', user?.otpExpiresAt);

    await prisma.$disconnect();
}

debugAuth();
