import { prisma } from '../../db/prisma';
import type { CreateUnitInput, UpdateUnitInput } from './validation';

export async function listUnits(propertyId?: string, opts?: { skip?: number; take?: number; userId?: string; caretakerId?: string; houseOwnerId?: string }) {
  const where: any = {
    ...(propertyId ? { propertyId } : {}),
    ...(opts?.userId ? {
      OR: [
        { managers: { some: { id: opts.userId } } },
        { property: { managers: { some: { id: opts.userId } } } }
      ]
    } : {}),
    ...(opts?.caretakerId ? {
      OR: [
        { caretakers: { some: { id: opts.caretakerId } } },
        { property: { caretakers: { some: { id: opts.caretakerId } } } }
      ]
    } : {}),
    ...(opts?.houseOwnerId ? {
      OR: [
        { houseOwners: { some: { id: opts.houseOwnerId } } },
        { property: { houseOwners: { some: { id: opts.houseOwnerId } } } }
      ]
    } : {})
  };

  return prisma.unit.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
  });
}

export async function createUnit(data: CreateUnitInput) {
  const { managerIds, careTakerIds, houseOwnerIds, ...rest } = data;
  return prisma.unit.create({
    data: {
      ...rest,
      managers: managerIds ? { connect: managerIds.map(id => ({ id })) } : undefined,
      caretakers: careTakerIds ? { connect: careTakerIds.map(id => ({ id })) } : undefined,
      houseOwners: houseOwnerIds ? { connect: houseOwnerIds.map(id => ({ id })) } : undefined
    }
  });
}

export async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      managers: true,
      caretakers: true,
      houseOwners: true
    }
  });
}

export async function updateUnit(id: string, data: UpdateUnitInput) {
  const { managerIds, careTakerIds, houseOwnerIds, ...rest } = data;
  return prisma.unit.update({
    where: { id },
    data: {
      ...rest,
      managers: managerIds ? { set: managerIds.map(id => ({ id })) } : undefined,
      caretakers: careTakerIds ? { set: careTakerIds.map(id => ({ id })) } : undefined,
      houseOwners: houseOwnerIds ? { set: houseOwnerIds.map(id => ({ id })) } : undefined
    }
  });
}

export async function deleteUnit(id: string) {
  return prisma.unit.delete({ where: { id } });
}
