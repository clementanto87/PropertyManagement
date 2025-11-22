import { prisma } from '../../db/prisma';
import * as emailService from '../../services/email/emailService';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const requestOtp = async (email: string) => {
    // 1. Check if user exists and is a tenant
    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role !== 'TENANT') {
        throw new Error('Unauthorized access');
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash OTP for storage
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 4. Set expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Save to DB
    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: hashedOtp,
            otpExpiresAt: expiresAt
        }
    });

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

    return { message: 'OTP sent successfully' };
};

export const verifyOtp = async (email: string, otp: string) => {
    // 1. Find user
    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
        throw new Error('Invalid request');
    }

    // 2. Check expiration
    if (new Date() > user.otpExpiresAt) {
        throw new Error('OTP expired');
    }

    // 3. Verify OTP
    const isValid = await bcrypt.compare(otp, user.otpCode);
    if (!isValid) {
        throw new Error('Invalid OTP');
    }

    // 4. Clear OTP fields
    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: null,
            otpExpiresAt: null
        }
    });

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
};
