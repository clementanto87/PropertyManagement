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
    unitId?: string,
    userContext?: {
        userId?: string;
        role?: string;
        tenantId?: string | null;
        caretakerId?: string | null;
        houseOwnerId?: string | null;
    },
    search?: string
) => {
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (leaseId) where.leaseId = leaseId;
    if (unitId) where.unitId = unitId;
    if (tenantId) {
        where.lease = { tenantId };
    }
    if (search) {
        where.title = { contains: search, mode: 'insensitive' };
    }

    // RBAC Logic
    if (userContext) {
        if (userContext.role === 'MANAGER') {
            const managerFilter = { managers: { some: { id: userContext.userId } } };
            const propertyManagerFilter = { property: { managers: { some: { id: userContext.userId } } } };

            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { property: managerFilter },
                        { unit: { OR: [managerFilter, propertyManagerFilter] } },
                        { lease: { unit: { OR: [managerFilter, propertyManagerFilter] } } }
                    ]
                }
            ];
        } else if (userContext.role === 'CARETAKER' && userContext.caretakerId) {
            const caretakerFilter = { caretakers: { some: { id: userContext.caretakerId } } };
            const propertyCaretakerFilter = { property: { caretakers: { some: { id: userContext.caretakerId } } } };

            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { property: caretakerFilter },
                        { unit: { OR: [caretakerFilter, propertyCaretakerFilter] } },
                        { lease: { unit: { OR: [caretakerFilter, propertyCaretakerFilter] } } }
                    ]
                }
            ];
        } else if (userContext.role === 'HOUSEOWNER' && userContext.houseOwnerId) {
            const ownerFilter = { houseOwners: { some: { id: userContext.houseOwnerId } } };
            const propertyOwnerFilter = { property: { houseOwners: { some: { id: userContext.houseOwnerId } } } };

            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { property: ownerFilter },
                        { unit: { OR: [ownerFilter, propertyOwnerFilter] } },
                        { lease: { unit: { OR: [ownerFilter, propertyOwnerFilter] } } }
                    ]
                }
            ];
        } else if (userContext.role === 'TENANT' && userContext.tenantId) {
            // Tenants see documents linked to their lease, or their unit/property (if public/shared?)
            // Usually tenants only see Lease documents or specific Unit documents.
            // Let's assume they see documents linked to their Lease, and maybe Unit/Property if explicitly shared?
            // For now, let's restrict to Lease documents + Unit/Property documents linked to their unit.
            // But documents table doesn't have "isShared" flag.
            // Let's assume if a document is attached to their Unit/Property, they can see it (e.g. Manuals).

            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { lease: { tenantId: userContext.tenantId } },
                        { unit: { leases: { some: { tenantId: userContext.tenantId } } } },
                        { property: { units: { some: { leases: { some: { tenantId: userContext.tenantId } } } } } }
                    ]
                }
            ];
        }
    }

    return prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            property: { select: { name: true } },
            unit: { select: { unitNumber: true } },
            lease: {
                include: {
                    tenant: { select: { name: true } }
                }
            }
        }
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
