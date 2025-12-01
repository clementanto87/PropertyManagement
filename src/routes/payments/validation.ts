import { z } from 'zod';

export const createPaymentSchema = z.object({
    leaseId: z.string().cuid(),
    amount: z.number().positive(),
    dueDate: z.string().datetime().or(z.date()),
    paymentMethod: z.enum(['CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER']).optional(),
    notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
    amount: z.number().positive().optional(),
    dueDate: z.string().datetime().or(z.date()).optional(),
    paymentMethod: z.enum(['CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER']).optional(),
    notes: z.string().optional(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
});

export const recordPaymentSchema = z.object({
    paidAt: z.string().datetime().or(z.date()),
    paymentMethod: z.enum(['CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER']),
    notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
