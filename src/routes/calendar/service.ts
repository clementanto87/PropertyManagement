import { prisma } from '../../db/prisma';

export type CalendarEvent = {
    id: string;
    type: 'LEASE_START' | 'LEASE_END' | 'PAYMENT_DUE' | 'WORK_ORDER' | 'FOLLOW_UP';
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    metadata: any;
};

export const getCalendarEvents = async (filters: {
    startDate: string;
    endDate: string;
    types?: string[];
}) => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const types = filters.types || ['LEASE_START', 'LEASE_END', 'PAYMENT_DUE', 'WORK_ORDER', 'FOLLOW_UP'];

    const events: CalendarEvent[] = [];

    // Lease Events
    if (types.includes('LEASE_START') || types.includes('LEASE_END')) {
        const leases = await prisma.lease.findMany({
            where: {
                OR: [
                    {
                        startDate: {
                            gte: start,
                            lte: end,
                        },
                    },
                    {
                        endDate: {
                            gte: start,
                            lte: end,
                        },
                    },
                ],
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        unitNumber: true,
                        property: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        leases.forEach((lease) => {
            if (types.includes('LEASE_START') && lease.startDate >= start && lease.startDate <= end) {
                events.push({
                    id: `lease-start-${lease.id}`,
                    type: 'LEASE_START',
                    title: `Lease Start - ${lease.tenant.name}`,
                    start: lease.startDate,
                    end: lease.startDate,
                    allDay: true,
                    metadata: {
                        leaseId: lease.id,
                        tenantId: lease.tenantId,
                        tenantName: lease.tenant.name,
                        property: lease.unit?.property?.name,
                        unit: lease.unit?.unitNumber,
                    },
                });
            }

            if (types.includes('LEASE_END') && lease.endDate >= start && lease.endDate <= end) {
                events.push({
                    id: `lease-end-${lease.id}`,
                    type: 'LEASE_END',
                    title: `Lease Expiring - ${lease.tenant.name}`,
                    start: lease.endDate,
                    end: lease.endDate,
                    allDay: true,
                    metadata: {
                        leaseId: lease.id,
                        tenantId: lease.tenantId,
                        tenantName: lease.tenant.name,
                        property: lease.unit?.property?.name,
                        unit: lease.unit?.unitNumber,
                    },
                });
            }
        });
    }

    // Payment Events
    if (types.includes('PAYMENT_DUE')) {
        const payments = await prisma.payment.findMany({
            where: {
                dueDate: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                lease: {
                    include: {
                        tenant: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        payments.forEach((payment) => {
            events.push({
                id: `payment-${payment.id}`,
                type: 'PAYMENT_DUE',
                title: `Rent Due - ${payment.lease.tenant.name} ($${(payment.amount / 100).toFixed(0)})`,
                start: payment.dueDate,
                end: payment.dueDate,
                allDay: true,
                metadata: {
                    paymentId: payment.id,
                    tenantId: payment.lease.tenantId,
                    tenantName: payment.lease.tenant.name,
                    amount: payment.amount,
                    status: payment.status,
                },
            });
        });
    }

    // Work Order Events - Skipped (WorkOrder model doesn't have scheduledDate field)
    // Can be added later if scheduledDate is added to the schema

    // Communication Follow-ups
    if (types.includes('FOLLOW_UP')) {
        const communications = await prisma.communication.findMany({
            where: {
                followUpRequired: true,
                followUpDate: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        communications.forEach((comm) => {
            if (comm.followUpDate) {
                events.push({
                    id: `follow-up-${comm.id}`,
                    type: 'FOLLOW_UP',
                    title: `Follow-up - ${comm.tenant?.name || 'Unknown'}`,
                    start: comm.followUpDate,
                    end: comm.followUpDate,
                    allDay: true,
                    metadata: {
                        communicationId: comm.id,
                        tenantId: comm.tenantId,
                        tenantName: comm.tenant?.name,
                        summary: comm.summary,
                    },
                });
            }
        });
    }

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
};
