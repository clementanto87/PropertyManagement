import { prisma } from '../../db/prisma';
import type { CreatePropertyInput, UpdatePropertyInput } from './validation';

export async function listProperties(opts?: { skip?: number; take?: number }) {
  return prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
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
