import { prisma } from '../../db/prisma';
import type { CreateVendorInput, UpdateVendorInput } from './validation';

export async function listVendors(opts?: { skip?: number; take?: number }) {
  return prisma.vendor.findMany({ orderBy: { createdAt: 'desc' }, skip: opts?.skip, take: opts?.take });
}

export async function createVendor(data: CreateVendorInput) {
  const { propertyIds, unitIds, ...rest } = data;
  return prisma.vendor.create({
    data: {
      ...rest,
      properties: propertyIds ? { connect: propertyIds.map(id => ({ id })) } : undefined,
      units: unitIds ? { connect: unitIds.map(id => ({ id })) } : undefined
    }
  });
}

export async function getVendor(id: string) {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      properties: { select: { id: true, name: true } },
      units: { select: { id: true, unitNumber: true } }
    }
  });
}

export async function updateVendor(id: string, data: UpdateVendorInput) {
  const { propertyIds, unitIds, ...rest } = data;
  return prisma.vendor.update({
    where: { id },
    data: {
      ...rest,
      properties: propertyIds ? { set: propertyIds.map(id => ({ id })) } : undefined,
      units: unitIds ? { set: unitIds.map(id => ({ id })) } : undefined
    }
  });
}

export async function deleteVendor(id: string) {
  return prisma.vendor.delete({ where: { id } });
}
