import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTenantRecord() {
    try {
        const email = 'clement.anto@gmail.com';

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            return;
        }

        console.log(`\n✅ Found user: ${user.name} (${user.email})`);

        // Check if user already has a tenant record
        if (user.tenantId) {
            const existingTenant = await prisma.tenant.findUnique({
                where: { id: user.tenantId },
                include: {
                    property: true,
                    unit: true
                }
            });

            if (existingTenant) {
                console.log('\n✅ User already has a tenant record:');
                console.log(`   Property: ${existingTenant.property?.name || 'N/A'}`);
                console.log(`   Unit: ${existingTenant.unit?.unitNumber || 'N/A'}`);
                return;
            }
        }

        console.log('\n🏗️  Creating demo property and unit...');

        // Create demo property
        const demoProperty = await prisma.property.create({
            data: {
                name: 'Sunset Apartments',
                address: '123 Main Street',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                type: 'APARTMENT',
                units: {
                    create: {
                        unitNumber: '4B',
                        bedrooms: 2,
                        bathrooms: 1,
                        sizeSqft: 850
                    }
                }
            },
            include: {
                units: true
            }
        });

        console.log(`✅ Created demo property: ${demoProperty.name}`);
        console.log(`✅ Created demo unit: ${demoProperty.units[0].unitNumber}`);

        // Create tenant record
        const tenant = await prisma.tenant.create({
            data: {
                userId: user.id,
                propertyId: demoProperty.id,
                unitId: demoProperty.units[0].id,
                firstName: user.name?.split(' ')[0] || 'Clement',
                lastName: user.name?.split(' ').slice(1).join(' ') || 'Anto',
                email: user.email,
                phone: '+1234567890',
                moveInDate: new Date('2024-01-01')
            }
        });

        // Update user with tenantId
        await prisma.user.update({
            where: { id: user.id },
            data: { tenantId: tenant.id }
        });

        // Create an active lease
        await prisma.lease.create({
            data: {
                tenantId: tenant.id,
                propertyId: demoProperty.id,
                unitId: demoProperty.units[0].id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2026-06-30'),
                monthlyRent: 1850,
                securityDeposit: 1850,
                status: 'ACTIVE',
                terms: 'Standard lease agreement terms apply.'
            }
        });

        console.log('\n✅ Created tenant record successfully!');
        console.log(`   Property: ${demoProperty.name}`);
        console.log(`   Unit: ${demoProperty.units[0].unitNumber}`);
        console.log(`   Monthly Rent: $1,850`);
        console.log(`   Lease: Active until Jun 2026`);
        console.log('\n🚀 All set! You can now log in to the tenant mobile app.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTenantRecord();
