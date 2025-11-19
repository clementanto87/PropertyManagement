import { prisma } from '../../db/prisma';
import type { CreateTenantInput, UpdateTenantInput } from './validation';

export async function listTenants(opts?: { skip?: number; take?: number }) {
  return prisma.tenant.findMany({ orderBy: { createdAt: 'desc' }, skip: opts?.skip, take: opts?.take });
}

export async function createTenant(data: CreateTenantInput) {
  return prisma.tenant.create({ data });
}

export async function getTenant(id: string) {
  return prisma.tenant.findUnique({ where: { id } });
}

export async function updateTenant(id: string, data: UpdateTenantInput) {
  return prisma.tenant.update({ where: { id }, data });
}

export async function deleteTenant(id: string) {
  return prisma.tenant.delete({ where: { id } });
}
