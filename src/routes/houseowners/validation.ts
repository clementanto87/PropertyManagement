import { z } from 'zod';

export const createHouseOwnerSchema = z.object({
    name: z.string().min(1),
    contact: z.string().optional(),
    rateInfo: z.string().optional(),
    insured: z.boolean().optional(),
    propertyIds: z.array(z.string()).optional(),
    unitIds: z.array(z.string()).optional()
});

export const updateHouseOwnerSchema = createHouseOwnerSchema.partial();

export type CreateHouseOwnerInput = z.infer<typeof createHouseOwnerSchema>;
export type UpdateHouseOwnerInput = z.infer<typeof updateHouseOwnerSchema>;
