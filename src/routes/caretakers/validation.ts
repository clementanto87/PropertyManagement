import { z } from 'zod';

export const createCareTakerSchema = z.object({
    name: z.string().min(1),
    contact: z.string().optional(),
    rateInfo: z.string().optional(),
    insured: z.boolean().optional(),
    propertyIds: z.array(z.string()).optional(),
    unitIds: z.array(z.string()).optional()
});

export const updateCareTakerSchema = createCareTakerSchema.partial();

export type CreateCareTakerInput = z.infer<typeof createCareTakerSchema>;
export type UpdateCareTakerInput = z.infer<typeof updateCareTakerSchema>;
