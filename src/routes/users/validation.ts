import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(),
    name: z.string().min(1),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CARETAKER', 'HOUSEOWNER']),
    tenantId: z.string().optional(),
    propertyIds: z.array(z.string()).optional(),
    unitIds: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CARETAKER', 'HOUSEOWNER']).optional(),
});

export const assignPropertiesSchema = z.object({
    propertyIds: z.array(z.string()).optional(),
    unitIds: z.array(z.string()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignPropertiesInput = z.infer<typeof assignPropertiesSchema>;
