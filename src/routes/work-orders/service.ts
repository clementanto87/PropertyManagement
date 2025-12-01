import { prisma } from '../../db/prisma';
import type { CreateWorkOrderInput, UpdateWorkOrderInput } from './validation';

export async function listWorkOrders(unitId?: string, status?: string, opts?: { skip?: number; take?: number; caretakerId?: string; houseOwnerId?: string }) {
  return prisma.workOrder.findMany({
    where: {
      ...(unitId ? { unitId } : {}),
      ...(status ? { status: status as any } : {}),
      ...(opts?.caretakerId ? {
        unit: {
          OR: [
            { caretakers: { some: { id: opts.caretakerId } } },
            { property: { caretakers: { some: { id: opts.caretakerId } } } }
          ]
        }
      } : {}),
      ...(opts?.houseOwnerId ? {
        unit: {
          OR: [
            { houseOwners: { some: { id: opts.houseOwnerId } } },
            { property: { houseOwners: { some: { id: opts.houseOwnerId } } } }
          ]
        }
      } : {})
    },
    include: {
      unit: {
        include: {
          property: true
        }
      },
      vendor: true
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
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          property: true
        }
      },
      vendor: true
    }
  });
}

export async function updateWorkOrder(id: string, data: UpdateWorkOrderInput) {
  return prisma.workOrder.update({
    where: { id },
    data,
    include: {
      unit: {
        include: {
          property: true
        }
      },
      vendor: true
    }
  });
}

export async function deleteWorkOrder(id: string) {
  return prisma.workOrder.delete({ where: { id } });
}
