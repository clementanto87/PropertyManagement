import { z } from 'zod';

export const createAgreementSchema = z.object({
    leaseId: z.string().cuid(),
    templateContent: z.string().optional().default(''),
    expiresAt: z.string().datetime().optional(),
});

export const sendAgreementSchema = z.object({
    agreementId: z.string().cuid(),
    tenantEmail: z.string().email(),
});

export const signAgreementSchema = z.object({
    agreementId: z.string().cuid(),
    signerType: z.enum(['LANDLORD', 'TENANT']),
    signerName: z.string().min(1, 'Signer name is required'),
    signerEmail: z.string().email(),
    signatureData: z.string().optional(),
    signatureMethod: z.enum(['TYPED', 'DRAWN']).default('TYPED'),
    ipAddress: z.string().optional(),
});

export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;
export type SendAgreementInput = z.infer<typeof sendAgreementSchema>;
export type SignAgreementInput = z.infer<typeof signAgreementSchema>;
