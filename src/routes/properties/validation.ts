import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  type: z.string().default('apartment'),
  price: z.number().default(0),
  bedrooms: z.number().default(0),
  bathrooms: z.number().default(0),
  area: z.number().default(0),
  status: z.string().default('vacant'),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  yearBuilt: z.number().optional(),
  parkingSpaces: z.number().optional(),
  image: z.string().optional()
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
