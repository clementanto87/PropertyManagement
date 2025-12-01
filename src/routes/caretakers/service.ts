import { prisma } from '../../db/prisma';
import type { CreateCareTakerInput, UpdateCareTakerInput } from './validation';

export async function listCareTakers(opts?: { skip?: number; take?: number }) {
    return prisma.careTaker.findMany({ orderBy: { createdAt: 'desc' }, skip: opts?.skip, take: opts?.take });
}

export async function createCareTaker(data: CreateCareTakerInput) {
    const { propertyIds, unitIds, ...rest } = data;
    return prisma.careTaker.create({
        data: {
            ...rest,
            properties: propertyIds ? { connect: propertyIds.map(id => ({ id })) } : undefined,
            units: unitIds ? { connect: unitIds.map(id => ({ id })) } : undefined
        }
    });
}

export async function getCareTaker(id: string) {
    return prisma.careTaker.findUnique({
        where: { id },
        include: {
            properties: { select: { id: true, name: true } },
            units: { select: { id: true, unitNumber: true } }
        }
    });
}

export async function updateCareTaker(id: string, data: UpdateCareTakerInput) {
    const { propertyIds, unitIds, ...rest } = data;
    return prisma.careTaker.update({
        where: { id },
        data: {
            ...rest,
            properties: propertyIds ? { set: propertyIds.map(id => ({ id })) } : undefined,
            units: unitIds ? { set: unitIds.map(id => ({ id })) } : undefined
        }
    });
}

export async function deleteCareTaker(id: string) {
    return prisma.careTaker.delete({ where: { id } });
}
