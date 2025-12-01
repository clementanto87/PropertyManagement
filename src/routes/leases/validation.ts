import { z } from 'zod';

export const leaseStatusEnum = z.enum(['ACTIVE', 'TERMINATED', 'EXPIRED', 'PENDING']);

export const createLeaseSchema = z.object({
  unitId: z.string().cuid(),
  tenantId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  securityDeposit: z.number().int().nonnegative().optional(),
  rentAmount: z.number().int().positive(),
  status: leaseStatusEnum.optional()
});

export const updateLeaseSchema = createLeaseSchema.partial();

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
