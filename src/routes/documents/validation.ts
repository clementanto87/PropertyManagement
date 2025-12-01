import { z } from 'zod';

export const createDocumentSchema = z.object({
    title: z.string().min(1),
    type: z.string().default('OTHER'),
    url: z.string().optional(), // Optional because it might be handled via file upload
    propertyId: z.string().cuid().optional(),
    leaseId: z.string().cuid().optional(),
    unitId: z.string().cuid().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
