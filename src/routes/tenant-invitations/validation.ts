import { z } from 'zod';

export const createInvitationSchema = z.object({
    tenantId: z.string().cuid(),
    email: z.string().email(),
    expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const validateTokenSchema = z.object({
    token: z.string().min(1),
});

export const acceptInvitationSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type ValidateTokenInput = z.infer<typeof validateTokenSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
