import { prisma } from '../../db/prisma';
import type { CreateVendorInput, UpdateVendorInput } from './validation';

export async function listVendors(opts?: { skip?: number; take?: number }) {
  return prisma.vendor.findMany({ orderBy: { createdAt: 'desc' }, skip: opts?.skip, take: opts?.take });
}

export async function createVendor(data: CreateVendorInput) {
  return prisma.vendor.create({ data });
}

export async function getVendor(id: string) {
  return prisma.vendor.findUnique({ where: { id } });
}

export async function updateVendor(id: string, data: UpdateVendorInput) {
  return prisma.vendor.update({ where: { id }, data });
}

export async function deleteVendor(id: string) {
  return prisma.vendor.delete({ where: { id } });
}
