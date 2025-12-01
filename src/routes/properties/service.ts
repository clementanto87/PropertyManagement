import { prisma } from '../../db/prisma';
import type { CreatePropertyInput, UpdatePropertyInput } from './validation';

export async function listProperties(opts?: { skip?: number; take?: number; userId?: string; caretakerId?: string; houseOwnerId?: string; includeUnits?: boolean }) {
  const where: any = {};

  if (opts?.userId) {
    where.managers = { some: { id: opts.userId } };
  }

  if (opts?.caretakerId) {
    where.caretakers = { some: { id: opts.caretakerId } };
  }

  if (opts?.houseOwnerId) {
    where.houseOwners = { some: { id: opts.houseOwnerId } };
  }

  return prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take,
    include: {
      managers: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      units: opts?.includeUnits ? {
        select: {
          id: true,
          unitNumber: true
        }
      } : false
    }
  });
}

export async function createProperty(data: CreatePropertyInput) {
  return prisma.property.create({ data });
}

export async function getProperty(id: string) {
  return prisma.property.findUnique({ where: { id } });
}

export async function updateProperty(id: string, data: UpdatePropertyInput) {
  return prisma.property.update({ where: { id }, data });
}

export async function deleteProperty(id: string) {
  return prisma.property.delete({ where: { id } });
}
