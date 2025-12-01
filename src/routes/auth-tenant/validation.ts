import { z } from 'zod';

export const otpLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const otpVerifySchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});
