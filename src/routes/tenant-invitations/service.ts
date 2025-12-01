import { prisma } from '../../db/prisma';
import { hashPassword } from '../../lib/auth';
import type { CreateInvitationInput, AcceptInvitationInput } from './validation';
import { sendTenantInvitationEmail } from '../../services/email/emailService';
import { logger } from '../../utils/logger';
import { generateToken } from '../../utils/jwt';
import crypto from 'crypto';

export async function createInvitation(data: CreateInvitationInput) {
    const { tenantId, email, expiresInDays } = data;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        throw new Error('Tenant not found');
    }

    // Check if tenant already has a user account
    if (tenant.email) {
        const existingUser = await prisma.user.findUnique({
            where: { email: tenant.email },
        });

        if (existingUser) {
            throw new Error('Tenant already has an account');
        }
    }

    // Check for existing active invitation
    const existingInvitation = await prisma.tenantInvitation.findFirst({
        where: {
            tenantId,
            acceptedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    if (existingInvitation) {
        throw new Error('Active invitation already exists for this tenant');
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create invitation
    const invitation = await prisma.tenantInvitation.create({
        data: {
            tenantId,
            email,
            token,
            expiresAt,
        },
    });

    // Send invitation email
    try {
        await sendTenantInvitationEmail(email, tenant.name, token, expiresAt);
        logger.info(`Tenant invitation sent to ${email}`);
    } catch (error) {
        logger.error({ error }, 'Failed to send tenant invitation email');
        // Don't throw error - invitation is created, email failure is logged
    }

    return invitation;
}

export async function validateToken(token: string) {
    const invitation = await prisma.tenantInvitation.findUnique({
        where: { token },
        include: {
            tenant: true,
        },
    });

    if (!invitation) {
        throw new Error('Invalid invitation token');
    }

    if (invitation.acceptedAt) {
        throw new Error('Invitation has already been accepted');
    }

    if (invitation.expiresAt < new Date()) {
        throw new Error('Invitation has expired');
    }

    return invitation;
}

export async function acceptInvitation(data: AcceptInvitationInput) {
    const { token, password } = data;

    // Validate token
    const invitation = await validateToken(token);

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
        where: { email: invitation.email },
    });

    if (existingUser) {
        throw new Error('User account already exists with this email');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user account
    const user = await prisma.user.create({
        data: {
            email: invitation.email,
            password: hashedPassword,
            name: invitation.tenant.name,
            role: 'TENANT',
            tenantId: invitation.tenantId,
        },
    });

    // Update tenant email if not set
    if (!invitation.tenant.email) {
        await prisma.tenant.update({
            where: { id: invitation.tenantId },
            data: { email: invitation.email },
        });
    }

    // Mark invitation as accepted
    await prisma.tenantInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
    });

    // Generate auth token
    const authToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    logger.info(`Tenant invitation accepted for ${invitation.email}`);

    return { user, tenant: invitation.tenant, token: authToken };
}

export async function listInvitations(tenantId?: string) {
    return prisma.tenantInvitation.findMany({
        where: tenantId ? { tenantId } : undefined,
        include: {
            tenant: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}
