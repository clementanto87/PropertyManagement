import { prisma } from '../../db/prisma';
import type { CreateUnitInput, UpdateUnitInput } from './validation';

export async function listUnits(propertyId?: string, opts?: { skip?: number; take?: number }) {
  return prisma.unit.findMany({
    where: propertyId ? { propertyId } : undefined,
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
  });
}

export async function createUnit(data: CreateUnitInput) {
  return prisma.unit.create({ data });
}

export async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: { property: true }
  });
}

export async function updateUnit(id: string, data: UpdateUnitInput) {
  return prisma.unit.update({ where: { id }, data });
}

export async function deleteUnit(id: string) {
  return prisma.unit.delete({ where: { id } });
}
