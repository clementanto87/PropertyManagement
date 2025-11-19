import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  rateInfo: z.string().optional(),
  insured: z.boolean().optional()
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
