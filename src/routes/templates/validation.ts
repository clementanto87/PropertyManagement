import { z } from 'zod';

export const createTemplateSchema = z.object({
    type: z.enum(['EMAIL', 'AGREEMENT', 'INVOICE']),
    name: z.string().min(1, 'Name is required'),
    subject: z.string().optional(),
    body: z.string().min(1, 'Body is required'),
    category: z.string().min(1, 'Category is required'),
    variables: z.record(z.string()),
    isActive: z.boolean().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();
