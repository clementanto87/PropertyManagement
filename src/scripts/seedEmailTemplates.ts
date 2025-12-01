import { PrismaClient, TemplateType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
    {
        name: 'Rent Reminder',
        subject: 'Rent Payment Reminder - Due {{dueDate}}',
        body: 'Dear {{tenantName}},\n\nThis is a friendly reminder that your rent payment of ${{rentAmount}} is due on {{dueDate}}.\n\nProperty: {{propertyName}}\nUnit: {{unitNumber}}\nAmount Due: ${{rentAmount}}\n\nPlease ensure payment is made by the due date to avoid any late fees.\n\nIf you have already made the payment, please disregard this message.\n\nThank you,\nProperty Management Team',
        category: 'rent_reminder',
        variables: {
            tenantName: 'Tenant name',
            rentAmount: 'Monthly rent amount',
            dueDate: 'Payment due date',
            propertyName: 'Property name',
            unitNumber: 'Unit number',
        },
    },
    {
        name: 'Welcome Email',
        subject: 'Welcome to {{propertyName}}!',
        body: 'Dear {{tenantName}},\n\nWelcome to {{propertyName}}! We are excited to have you as our new tenant.\n\nYour lease begins on {{leaseStartDate}} for Unit {{unitNumber}}.\n\nImportant Information:\n- Monthly Rent: ${{rentAmount}}\n- Security Deposit: ${{securityDeposit}}\n- Lease End Date: {{leaseEndDate}}\n\nIf you have any questions or need assistance, please do not hesitate to contact us.\n\nBest regards,\nProperty Management Team',
        category: 'welcome',
        variables: {
            tenantName: 'Tenant name',
            propertyName: 'Property name',
            unitNumber: 'Unit number',
            leaseStartDate: 'Lease start date',
            leaseEndDate: 'Lease end date',
            rentAmount: 'Monthly rent',
            securityDeposit: 'Security deposit amount',
        },
    },
    {
        name: 'Maintenance Update',
        subject: 'Maintenance Update - Work Order #{{workOrderId}}',
        body: 'Dear {{tenantName}},\n\nWe wanted to update you on the status of your maintenance request.\n\nWork Order: #{{workOrderId}}\nIssue: {{issueDescription}}\nStatus: {{status}}\n\n{{updateMessage}}\n\nThank you for your patience.\n\nProperty Management Team',
        category: 'maintenance',
        variables: {
            tenantName: 'Tenant name',
            workOrderId: 'Work order ID',
            issueDescription: 'Description of the issue',
            status: 'Current status',
            updateMessage: 'Update message',
        },
    },
    {
        name: 'Lease Renewal Notice',
        subject: 'Lease Renewal - {{propertyName}} Unit {{unitNumber}}',
        body: 'Dear {{tenantName}},\n\nYour current lease for Unit {{unitNumber}} at {{propertyName}} is set to expire on {{leaseEndDate}}.\n\nWe would love to have you continue as our tenant. Please let us know if you are interested in renewing your lease.\n\nCurrent Rent: ${{currentRent}}\n\nPlease respond by {{responseDeadline}} to let us know your decision.\n\nBest regards,\nProperty Management Team',
        category: 'lease_renewal',
        variables: {
            tenantName: 'Tenant name',
            propertyName: 'Property name',
            unitNumber: 'Unit number',
            leaseEndDate: 'Current lease end date',
            currentRent: 'Current monthly rent',
            responseDeadline: 'Response deadline',
        },
    },
    {
        name: 'Move-Out Instructions',
        subject: 'Move-Out Instructions - {{propertyName}}',
        body: 'Dear {{tenantName}},\n\nAs your lease end date ({{leaseEndDate}}) approaches, here are the move-out instructions:\n\nMove-Out Checklist:\n1. Clean the unit thoroughly\n2. Remove all personal belongings\n3. Return all keys and access cards\n4. Schedule a final walk-through inspection\n5. Provide forwarding address for security deposit return\n\nFinal Inspection: {{inspectionDate}}\n\nYour security deposit of ${{securityDeposit}} will be returned within {{depositReturnDays}} days after move-out, minus any deductions for damages or unpaid rent.\n\nPlease contact us to schedule your final walk-through.\n\nThank you for being our tenant!\n\nProperty Management Team',
        category: 'move_out',
        variables: {
            tenantName: 'Tenant name',
            propertyName: 'Property name',
            leaseEndDate: 'Lease end date',
            inspectionDate: 'Final inspection date',
            securityDeposit: 'Security deposit amount',
            depositReturnDays: 'Days to return deposit',
        },
    },
];

async function seedEmailTemplates() {
    console.log('Seeding email templates...');

    for (const template of defaultTemplates) {
        try {
            const existing = await prisma.template.findFirst({
                where: { name: template.name },
            });

            if (!existing) {
                await prisma.template.create({
                    data: {
                        ...template,
                        type: TemplateType.EMAIL,
                    },
                });
                console.log(`✓ Created template: ${template.name}`);
            } else {
                console.log(`- Template already exists: ${template.name}`);
            }
        } catch (error) {
            console.error(`✗ Failed to create template: ${template.name}`, error);
        }
    }

    console.log('Email templates seeding complete!');
}

seedEmailTemplates()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
