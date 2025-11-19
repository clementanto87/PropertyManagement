import { prisma } from '../../db/prisma';
import type { CreateLeaseInput, UpdateLeaseInput } from './validation';

export async function listLeases(unitId?: string, tenantId?: string, opts?: { skip?: number; take?: number }) {
  return prisma.lease.findMany({
    where: {
      ...(unitId ? { unitId } : {}),
      ...(tenantId ? { tenantId } : {})
    },
    include: {
      unit: {
        include: {
          property: true
        }
      },
      tenant: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
  });
}

export async function createLease(data: CreateLeaseInput) {
  // Coerce string dates to Date for DB
  const payload = { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) };
  return prisma.lease.create({ data: payload });
}

export async function getLease(id: string) {
  return prisma.lease.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          property: true
        }
      },
      tenant: true,
      payments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function updateLease(id: string, data: UpdateLeaseInput) {
  const payload: any = { ...data };
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  if (payload.endDate) payload.endDate = new Date(payload.endDate);
  return prisma.lease.update({ where: { id }, data: payload });
}

export async function deleteLease(id: string) {
  return prisma.lease.delete({ where: { id } });
}
