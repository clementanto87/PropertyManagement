import { z } from 'zod';

export const workOrderStatusEnum = z.enum(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']);

export const createWorkOrderSchema = z.object({
  unitId: z.string().cuid(),
  vendorId: z.string().cuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: workOrderStatusEnum.optional()
});

export const updateWorkOrderSchema = createWorkOrderSchema.partial();

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
