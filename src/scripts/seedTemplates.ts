import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_TEMPLATES = [
    // EMAIL TEMPLATES
    {
        type: 'EMAIL',
        name: 'Welcome Email',
        category: 'welcome',
        subject: 'Welcome to {{propertyName}}!',
        body: `Dear {{tenantName}},

Welcome to your new home at {{propertyName}}! We are delighted to have you as a resident.

Your lease starts on {{leaseStartDate}}. Your unit number is {{unitNumber}}.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
Property Management Team`,
        variables: {},
        isActive: true,
    },
    {
        type: 'EMAIL',
        name: 'Rent Reminder',
        category: 'rent_reminder',
        subject: 'Rent Reminder for {{propertyName}}',
        body: `Dear {{tenantName}},

This is a friendly reminder that your rent of {{rentAmount}} for {{propertyName}}, Unit {{unitNumber}} is due on {{dueDate}}.

Please ensure your payment is made by the due date to avoid any late fees.

Thank you for your prompt payment.

Best regards,
Property Management Team`,
        variables: {},
        isActive: true,
    },
    {
        type: 'EMAIL',
        name: 'Maintenance Request Received',
        category: 'maintenance',
        subject: 'Maintenance Request Received - {{propertyName}}',
        body: `Dear {{tenantName}},

We have received your maintenance request for {{propertyName}}, Unit {{unitNumber}}.

Our team will review the request and schedule a visit as soon as possible. We will keep you updated on the status.

Thank you for your patience.

Best regards,
Property Management Team`,
        variables: {},
        isActive: true,
    },
    {
        type: 'EMAIL',
        name: 'Lease Renewal Offer',
        category: 'lease_renewal',
        subject: 'Lease Renewal Offer - {{propertyName}}',
        body: `Dear {{tenantName}},

We hope you are enjoying your stay at {{propertyName}}. Your current lease is set to expire on {{leaseEndDate}}.

We would love to offer you a lease renewal for another year. The new rent amount will be {{rentAmount}}, effective from the start of the new lease term.

Please let us know if you are interested in renewing your lease.

Best regards,
Property Management Team`,
        variables: {},
        isActive: true,
    },

    // AGREEMENT TEMPLATES
    {
        type: 'AGREEMENT',
        name: 'Standard Residential Lease',
        category: 'lease',
        subject: null,
        body: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement (the "Agreement") is made and entered into on this day by and between {{landlordName}} ("Landlord") and {{tenantName}} ("Tenant").

1. PROPERTY
Landlord agrees to lease to Tenant, and Tenant agrees to lease from Landlord, the property located at {{propertyAddress}} (the "Premises").

2. TERM
The term of this Lease shall begin on {{leaseStartDate}} and end on {{leaseEndDate}}.

3. RENT
Tenant agrees to pay Landlord rent in the amount of {{rentAmount}} per month, payable on the first day of each month.

4. SECURITY DEPOSIT
Tenant shall pay a security deposit of {{securityDeposit}} prior to moving in. This deposit will be held to cover any damages to the Premises beyond normal wear and tear.

5. UTILITIES
Tenant shall be responsible for arranging and paying for all utility services required on the Premises.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

__________________________          __________________________
Landlord Signature                  Tenant Signature`,
        variables: {},
        isActive: true,
    },
    {
        type: 'AGREEMENT',
        name: 'Pet Addendum',
        category: 'addendum',
        subject: null,
        body: `PET ADDENDUM TO LEASE AGREEMENT

This Pet Addendum is attached to and made a part of the Lease Agreement dated {{leaseStartDate}} by and between {{landlordName}} ("Landlord") and {{tenantName}} ("Tenant") for the property located at {{propertyAddress}}.

1. PERMISSION
Landlord grants permission for Tenant to keep the following pet(s) on the Premises: __________________________________________________.

2. PET DEPOSIT
Tenant agrees to pay an additional pet deposit of $_________ (non-refundable/refundable).

3. RULES
Tenant agrees to comply with all community rules and regulations regarding pets, including cleaning up after the pet and keeping the pet under control at all times.

4. LIABILITY
Tenant shall be liable for any damages caused by the pet to the Premises or to any person or property.

__________________________          __________________________
Landlord Signature                  Tenant Signature`,
        variables: {},
        isActive: true,
    },

    // INVOICE TEMPLATES
    {
        type: 'INVOICE',
        name: 'Monthly Rent Invoice',
        category: 'rent',
        subject: null,
        body: `INVOICE

Invoice #: {{invoiceNumber}}
Date: {{issueDate}}
Due Date: {{dueDate}}

Bill To:
{{tenantName}}
{{unitNumber}}, {{propertyName}}

Description                     Amount
------------------------------------------------
Monthly Rent                    {{rentAmount}}
------------------------------------------------
Total Amount Due:               {{totalAmount}}

Please make checks payable to Property Management Company.
Thank you for your payment!`,
        variables: {},
        isActive: true,
    },
    {
        type: 'INVOICE',
        name: 'Security Deposit Invoice',
        category: 'fee',
        subject: null,
        body: `INVOICE

Invoice #: {{invoiceNumber}}
Date: {{issueDate}}
Due Date: {{dueDate}}

Bill To:
{{tenantName}}
{{unitNumber}}, {{propertyName}}

Description                     Amount
------------------------------------------------
Security Deposit                {{securityDeposit}}
------------------------------------------------
Total Amount Due:               {{totalAmount}}

Please make checks payable to Property Management Company.
Thank you!`,
        variables: {},
        isActive: true,
    },
];

async function main() {
    console.log('Start seeding templates...');

    for (const template of SAMPLE_TEMPLATES) {
        const existing = await prisma.template.findFirst({
            where: {
                name: template.name,
                type: template.type as any,
            },
        });

        if (!existing) {
            await prisma.template.create({
                data: template as any,
            });
            console.log(`Created template: ${template.name}`);
        } else {
            console.log(`Template already exists: ${template.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
