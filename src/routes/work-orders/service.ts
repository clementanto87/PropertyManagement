import { prisma } from '../../db/prisma';
import type { CreateWorkOrderInput, UpdateWorkOrderInput } from './validation';

export async function listWorkOrders(unitId?: string, status?: string, opts?: { skip?: number; take?: number }) {
  return prisma.workOrder.findMany({
    where: {
      ...(unitId ? { unitId } : {}),
      ...(status ? { status: status as any } : {})
    },
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
  });
}

export async function createWorkOrder(data: CreateWorkOrderInput) {
  return prisma.workOrder.create({ data });
}

export async function getWorkOrder(id: string) {
  return prisma.workOrder.findUnique({ where: { id } });
}

export async function updateWorkOrder(id: string, data: UpdateWorkOrderInput) {
  return prisma.workOrder.update({ where: { id }, data });
}

export async function deleteWorkOrder(id: string) {
  return prisma.workOrder.delete({ where: { id } });
}
