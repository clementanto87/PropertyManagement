import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  address: z.string().min(5, 'Address is required'),
  type: z.string().min(1, 'Property type is required'),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  bedrooms: z.string().min(1, 'Number of bedrooms is required').regex(/^\d+$/, 'Must be a whole number'),
  bathrooms: z.string().min(1, 'Number of bathrooms is required').regex(/^\d+(\.\d{1})?$/, 'Invalid format (e.g., 1 or 1.5)'),
  area: z.string().min(1, 'Area is required').regex(/^\d+$/, 'Must be a number'),
  status: z.enum(['vacant', 'occupied', 'maintenance']).default('vacant'),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  yearBuilt: z.string().optional(),
  parkingSpaces: z.string().optional(),
  image: z.string().optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
