import { prisma } from '../../db/prisma';
import type { CreateHouseOwnerInput, UpdateHouseOwnerInput } from './validation';

export async function listHouseOwners(opts?: { skip?: number; take?: number }) {
    return prisma.houseOwner.findMany({ orderBy: { createdAt: 'desc' }, skip: opts?.skip, take: opts?.take });
}

export async function createHouseOwner(data: CreateHouseOwnerInput) {
    const { propertyIds, unitIds, ...rest } = data;
    return prisma.houseOwner.create({
        data: {
            ...rest,
            properties: propertyIds ? { connect: propertyIds.map(id => ({ id })) } : undefined,
            units: unitIds ? { connect: unitIds.map(id => ({ id })) } : undefined
        }
    });
}

export async function getHouseOwner(id: string) {
    return prisma.houseOwner.findUnique({
        where: { id },
        include: {
            properties: { select: { id: true, name: true } },
            units: { select: { id: true, unitNumber: true } }
        }
    });
}

export async function updateHouseOwner(id: string, data: UpdateHouseOwnerInput) {
    const { propertyIds, unitIds, ...rest } = data;
    return prisma.houseOwner.update({
        where: { id },
        data: {
            ...rest,
            properties: propertyIds ? { set: propertyIds.map(id => ({ id })) } : undefined,
            units: unitIds ? { set: unitIds.map(id => ({ id })) } : undefined
        }
    });
}

export async function deleteHouseOwner(id: string) {
    return prisma.houseOwner.delete({ where: { id } });
}
