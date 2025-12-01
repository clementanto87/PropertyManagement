import { z } from 'zod';

export const createExpenseSchema = z.object({
  propertyId: z.string().cuid(),
  amount: z.number().int().nonnegative(),
  category: z.string().min(1),
  note: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  incurredAt: z.string().datetime()
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
