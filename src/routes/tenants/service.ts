import { prisma } from '../../db/prisma';
import type { CreateTenantInput, UpdateTenantInput } from './validation';

import { hashPassword } from '../../lib/auth';
import crypto from 'crypto';

export async function listTenants(opts?: { skip?: number; take?: number }) {
  return prisma.tenant.findMany({ orderBy: { createdAt: 'desc' }, skip: opts?.skip, take: opts?.take });
}

export async function createTenant(data: CreateTenantInput) {
  const tenant = await prisma.tenant.create({ data });

  // Auto-create user account if email is provided
  if (data.email) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (!existingUser) {
      // Generate a random password (they will use OTP mostly, but password is required)
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'TENANT',
          tenantId: tenant.id
        }
      });
    }
  }

  return tenant;
}

export async function getTenant(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
    include: {
      leases: {
        include: {
          unit: {
            include: {
              property: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      }
    }
  });
}

export async function updateTenant(id: string, data: UpdateTenantInput) {
  return prisma.tenant.update({ where: { id }, data });
}

export async function deleteTenant(id: string) {
  return prisma.tenant.delete({ where: { id } });
}
