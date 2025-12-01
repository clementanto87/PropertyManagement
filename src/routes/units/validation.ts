import { z } from 'zod';

export const unitStatusEnum = z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE']);

export const createUnitSchema = z.object({
  propertyId: z.string().cuid(),
  unitNumber: z.string().min(1),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  sizeSqft: z.number().int().positive().optional(),
  status: unitStatusEnum.optional(),
  managerIds: z.array(z.string()).optional(),
  careTakerIds: z.array(z.string()).optional(),
  houseOwnerIds: z.array(z.string()).optional()
});

export const updateUnitSchema = createUnitSchema.partial();

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
