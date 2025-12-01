import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFixTenantUser() {
    try {
        const email = 'clement.anto@gmail.com';

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            console.log('\n💡 You need to create a tenant user first.');
            console.log('Run: npm run seed or create a tenant through the admin panel');
            return;
        }

        console.log('\n📋 Current User Details:');
        console.log('========================');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`Role: ${user.role}`);
        console.log(`Tenant ID: ${user.tenantId}`);
        console.log(`Has Tenant Record: ${user.tenant ? 'Yes' : 'No'}`);

        // Check if user needs role update
        if (user.role !== 'TENANT') {
            console.log('\n⚠️  User role is not TENANT!');
            console.log(`Current role: ${user.role}`);
            console.log('\n🔧 Updating user role to TENANT...');

            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'TENANT' }
            });

            console.log('✅ User role updated to TENANT');
        } else {
            console.log('\n✅ User role is already TENANT');
        }

        // Check if user has tenant record
        if (!user.tenant && user.tenantId) {
            console.log('\n⚠️  User has tenantId but no tenant record found');
            const tenant = await prisma.tenant.findUnique({
                where: { id: user.tenantId },
                include: {
                    property: true,
                    unit: true
                }
            });

            if (tenant) {
                console.log('\n📋 Tenant Details:');
                console.log('==================');
                console.log(`Tenant ID: ${tenant.id}`);
                console.log(`Property: ${tenant.property?.name || 'N/A'}`);
                console.log(`Unit: ${tenant.unit?.unitNumber || 'N/A'}`);
            }
        }

        console.log('\n✅ All checks complete!');
        console.log('\n🚀 You can now try logging in with OTP again.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndFixTenantUser();
