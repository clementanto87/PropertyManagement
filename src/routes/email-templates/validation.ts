import { z } from 'zod';

export const createEmailTemplateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    category: z.enum(['rent_reminder', 'maintenance', 'welcome', 'lease_renewal', 'move_out']),
    variables: z.record(z.string()).optional().default({}),
    isActive: z.boolean().optional().default(true),
});

export const updateEmailTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    subject: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    category: z.enum(['rent_reminder', 'maintenance', 'welcome', 'lease_renewal', 'move_out']).optional(),
    variables: z.record(z.string()).optional(),
    isActive: z.boolean().optional(),
});

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
