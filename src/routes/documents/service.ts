import { prisma } from '../../db/prisma';
import { CreateDocumentInput } from './validation';

export const createDocument = async (data: CreateDocumentInput & {
    url: string;
    type?: string;
    unitId?: string;
}) => {
    return prisma.document.create({
        data: {
            title: data.title,
            propertyId: data.propertyId,
            leaseId: data.leaseId,
            unitId: data.unitId,
            url: data.url,
            type: data.type || 'document'
        }
    });
};

export const listDocuments = async (
    propertyId?: string,
    leaseId?: string,
    tenantId?: string,
    unitId?: string
) => {
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (leaseId) where.leaseId = leaseId;
    if (unitId) where.unitId = unitId;
    if (tenantId) {
        where.lease = { tenantId };
    }

    return prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
};

export const deleteDocument = async (id: string) => {
    return prisma.document.delete({
        where: { id },
    });
};

export const getDocument = async (id: string) => {
    return prisma.document.findUnique({
        where: { id }
    });
};
