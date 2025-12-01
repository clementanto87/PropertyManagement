import { createTenant, deleteTenant } from './src/routes/tenants/service';
import { prisma } from './src/db/prisma';

async function main() {
    const testEmail = 'test.tenant.auto@example.com';

    console.log('Creating tenant...');
    const tenant = await createTenant({
        name: 'Test Auto User',
        email: testEmail,
        phone: '555-0199'
    });
    console.log('Tenant created:', tenant.id);

    console.log('Checking for user...');
    const user = await prisma.user.findUnique({
        where: { email: testEmail }
    });

    if (user) {
        console.log('SUCCESS: User created automatically!');
        console.log('User Role:', user.role);
        console.log('User TenantID:', user.tenantId);
    } else {
        console.error('FAILURE: User was NOT created.');
    }

    // Cleanup
    console.log('Cleaning up...');
    if (user) await prisma.user.delete({ where: { id: user.id } });
    await deleteTenant(tenant.id);
    console.log('Cleanup complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
