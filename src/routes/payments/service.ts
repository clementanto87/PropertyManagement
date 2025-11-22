import { prisma } from '../../db/prisma';
import { CreatePaymentInput, RecordPaymentInput } from './validation';

// Generate unique receipt number
export const generateReceiptNumber = async (): Promise<string> => {
    const prefix = 'RCP';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
};

export const createPayment = async (data: CreatePaymentInput) => {
    return prisma.payment.create({
        data: {
            ...data,
            dueDate: new Date(data.dueDate),
        },
        include: {
            lease: {
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
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
                                    address: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const getPayments = async (filters: {
    leaseId?: string;
    tenantId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const where: any = {};

    if (filters.leaseId) {
        where.leaseId = filters.leaseId;
    }

    if (filters.tenantId) {
        where.lease = {
            tenantId: filters.tenantId,
        };
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
        where.dueDate = {};
        if (filters.startDate) {
            where.dueDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            where.dueDate.lte = new Date(filters.endDate);
        }
    }

    return prisma.payment.findMany({
        where,
        orderBy: {
            dueDate: 'desc',
        },
        include: {
            lease: {
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
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
                                    address: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const getPaymentById = async (id: string) => {
    return prisma.payment.findUnique({
        where: { id },
        include: {
            lease: {
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
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
                                    address: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const updatePayment = async (id: string, data: any) => {
    const updateData: any = { ...data };
    if (data.dueDate) {
        updateData.dueDate = new Date(data.dueDate);
    }

    return prisma.payment.update({
        where: { id },
        data: updateData,
        include: {
            lease: {
                include: {
                    tenant: true,
                },
            },
        },
    });
};

export const recordPayment = async (id: string, data: RecordPaymentInput) => {
    const receiptNumber = await generateReceiptNumber();

    return prisma.payment.update({
        where: { id },
        data: {
            paidAt: new Date(data.paidAt),
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            status: 'PAID',
            receiptNumber,
        },
        include: {
            lease: {
                include: {
                    tenant: true,
                },
            },
        },
    });
};

export const deletePayment = async (id: string) => {
    return prisma.payment.delete({
        where: { id },
    });
};
