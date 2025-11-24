import { prisma } from '../../db/prisma';
import * as emailService from '../../services/email/emailService';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const requestOtp = async (email: string) => {
    console.log('[requestOtp] Starting OTP request for:', email);
    // 1. Check if user exists and is a tenant
    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    console.log('[requestOtp] User found:', !!user);
    console.log('[requestOtp] User role:', user?.role);

    if (!user) {
        console.log('[requestOtp] ERROR: User not found');
        throw new Error('User not found');
    }

    if (user.role !== 'TENANT') {
        console.log('[requestOtp] ERROR: User is not a TENANT, role is:', user.role);
        throw new Error('Unauthorized access');
    }

    console.log('[requestOtp] User is valid TENANT, generating OTP...');

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('[requestOtp] OTP generated:', otp);

    // 3. Hash OTP for storage
    const hashedOtp = await bcrypt.hash(otp, 10);
    console.log('[requestOtp] OTP hashed successfully');

    // 4. Set expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    console.log('[requestOtp] OTP will expire at:', expiresAt.toISOString());

    // 5. Save to DB
    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: hashedOtp,
            otpExpiresAt: expiresAt
        }
    });
    console.log('[requestOtp] OTP saved to database');

    // 6. Send email
    await emailService.sendEmail({
        to: email,
        subject: 'Your Login OTP - PropertyPro',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Login Verification</h2>
        <p>Your One-Time Password (OTP) for logging in is:</p>
        <h1 style="background: #f3f4f6; padding: 20px; text-align: center; letter-spacing: 5px; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
    });
    console.log('[requestOtp] OTP email sent successfully');

    return { message: 'OTP sent successfully' };
};

// Track ongoing verification requests to prevent race conditions
const ongoingVerifications = new Map<string, Promise<any>>();

export const verifyOtp = async (email: string, otp: string) => {
    const requestId = `${email}-${Date.now()}`;
    console.log('[verifyOtp] Request ID:', requestId);
    console.log('[verifyOtp] Starting verification for:', email);
    console.log('[verifyOtp] OTP received:', otp);

    // Check if there's already an ongoing verification for this email
    if (ongoingVerifications.has(email)) {
        console.log('[verifyOtp] WARNING: Duplicate request detected! Waiting for ongoing verification...');
        return ongoingVerifications.get(email)!;
    }

    // Create the verification promise
    const verificationPromise = (async () => {
        try {
            // 1. Find user
            const user = await prisma.user.findUnique({
                where: { email },
                include: { tenant: true }
            });

            console.log('[verifyOtp] User found:', !!user);
            console.log('[verifyOtp] User has OTP code:', !!user?.otpCode);
            console.log('[verifyOtp] User has expiration:', !!user?.otpExpiresAt);

            if (!user || !user.otpCode || !user.otpExpiresAt) {
                console.log('[verifyOtp] ERROR: Invalid request - missing user or OTP data');
                throw new Error('Invalid request');
            }

            // 2. Check expiration
            const now = new Date();
            const isExpired = now > user.otpExpiresAt;
            console.log('[verifyOtp] Current time:', now.toISOString());
            console.log('[verifyOtp] OTP expires at:', user.otpExpiresAt.toISOString());
            console.log('[verifyOtp] Is expired?:', isExpired);

            if (isExpired) {
                console.log('[verifyOtp] ERROR: OTP expired');
                throw new Error('OTP expired');
            }

            // 3. Verify OTP
            console.log('[verifyOtp] Comparing OTP...');
            const isValid = await bcrypt.compare(otp, user.otpCode);
            console.log('[verifyOtp] OTP is valid?:', isValid);

            if (!isValid) {
                console.log('[verifyOtp] ERROR: Invalid OTP');
                throw new Error('Invalid OTP');
            }

            console.log('[verifyOtp] OTP verified successfully!');

            // 4. Clear OTP fields
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    otpCode: null,
                    otpExpiresAt: null
                }
            });
            console.log('[verifyOtp] OTP cleared from database');

            // 5. Generate JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log('[verifyOtp] JWT generated successfully');

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenantId
                }
            };
        } finally {
            // Remove from ongoing verifications
            ongoingVerifications.delete(email);
            console.log('[verifyOtp] Request completed, removed from ongoing verifications');
        }
    })();

    // Store the promise
    ongoingVerifications.set(email, verificationPromise);

    return verificationPromise;
};
