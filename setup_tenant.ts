import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupTenantUser() {
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
        console.log(`   Role: ${user.role}`);

        // Check if user already has a tenant record
        if (user.tenantId) {
            const existingTenant = await prisma.tenant.findUnique({
                where: { id: user.tenantId }
            });

            if (existingTenant) {
                console.log('\n✅ User already has a tenant record');
                console.log(`   Tenant Name: ${existingTenant.name}`);

                // Get lease information
                const lease = await prisma.lease.findFirst({
                    where: { tenantId: existingTenant.id },
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        }
                    }
                });

                if (lease) {
                    console.log(`   Property: ${lease.unit.property.name}`);
                    console.log(`   Unit: ${lease.unit.unitNumber}`);
                    console.log(`   Rent: $${lease.rentAmount}/month`);
                }

                console.log('\n🚀 All set! You can now log in to the tenant mobile app.');
                return;
            }
        }

        console.log('\n🏗️  Creating tenant record and demo data...');

        // Create demo property with unit
        const property = await prisma.property.create({
            data: {
                name: 'Sunset Apartments',
                address: '123 Main Street',
                type: 'apartment',
                price: 1850,
                bedrooms: 2,
                bathrooms: 1,
                area: 850,
                status: 'occupied',
                description: 'Beautiful 2-bedroom apartment in the heart of the city',
                features: ['Parking', 'Gym', 'Pool', 'Security'],
                units: {
                    create: {
                        unitNumber: '4B',
                        bedrooms: 2,
                        bathrooms: 1,
                        sizeSqft: 850,
                        status: 'OCCUPIED'
                    }
                }
            },
            include: {
                units: true
            }
        });

        console.log(`✅ Created property: ${property.name}`);
        console.log(`✅ Created unit: ${property.units[0].unitNumber}`);

        // Create tenant record
        const tenant = await prisma.tenant.create({
            data: {
                name: user.name || 'Clement Anto',
                email: user.email,
                phone: '+1234567890',
                emergencyContact: 'Emergency Contact: +1234567891'
            }
        });

        console.log(`✅ Created tenant record: ${tenant.name}`);

        // Update user with tenantId
        await prisma.user.update({
            where: { id: user.id },
            data: { tenantId: tenant.id }
        });

        // Create an active lease
        const lease = await prisma.lease.create({
            data: {
                unitId: property.units[0].id,
                tenantId: tenant.id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2026-06-30'),
                rentAmount: 1850,
                securityDeposit: 1850,
                status: 'ACTIVE'
            }
        });

        console.log(`✅ Created lease: $${lease.rentAmount}/month`);
        console.log(`   Start: ${lease.startDate.toLocaleDateString()}`);
        console.log(`   End: ${lease.endDate.toLocaleDateString()}`);

        console.log('\n✅ Setup complete!');
        console.log('\n📱 You can now log in to the tenant mobile app with:');
        console.log(`   Email: ${email}`);
        console.log(`   (OTP will be sent to your email)`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupTenantUser();
