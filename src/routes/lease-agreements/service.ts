import { prisma } from '../../db/prisma';
import type { CreateAgreementInput, SignAgreementInput } from './validation';
import { sendLeaseAgreementEmail, sendAgreementSignedNotification } from '../../services/email/emailService';
import { logger } from '../../utils/logger';
import { randomBytes } from 'crypto';

export async function createAgreement(data: CreateAgreementInput) {
    const { leaseId, templateContent, expiresAt } = data;

    // Verify lease exists
    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
            tenant: true,
            unit: {
                include: {
                    property: true,
                },
            },
        },
    });

    if (!lease) {
        throw new Error('Lease not found');
    }

    // Check if agreement already exists for this lease
    const existingAgreement = await prisma.leaseAgreement.findUnique({
        where: { leaseId },
    });

    if (existingAgreement) {
        throw new Error('Agreement already exists for this lease');
    }

    // Create agreement
    const agreement = await prisma.leaseAgreement.create({
        data: {
            leaseId,
            templateContent,
            status: 'DRAFT',
            expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        },
    });

    return agreement;
}

export async function getAgreement(id: string) {
    const agreement = await prisma.leaseAgreement.findUnique({
        where: { id },
        include: {
            lease: {
                include: {
                    tenant: true,
                    unit: {
                        include: {
                            property: true,
                        },
                    },
                },
            },
            signatures: true,
        },
    });

    return agreement;
}

export async function sendForSignature(agreementId: string, tenantEmail: string) {
    const agreement = await getAgreement(agreementId);

    if (!agreement) {
        throw new Error('Agreement not found');
    }

    if (agreement.status !== 'DRAFT') {
        throw new Error('Agreement has already been sent');
    }

    // Update agreement status
    await prisma.leaseAgreement.update({
        where: { id: agreementId },
        data: {
            status: 'PENDING',
            sentAt: new Date(),
        },
    });

    // Send email
    try {
        await sendLeaseAgreementEmail(
            tenantEmail,
            agreement.lease.tenant.name,
            agreement.lease.unit.property.address,
            agreementId,
            agreement.expiresAt || new Date()
        );
        logger.info(`Lease agreement email sent to ${tenantEmail}`);
    } catch (error) {
        logger.error({ error }, 'Failed to send lease agreement email');
        throw new Error('Failed to send agreement email');
    }

    return agreement;
}

export async function signAgreement(data: SignAgreementInput) {
    const { agreementId, signerType, signerName, signerEmail, signatureData, signatureMethod, ipAddress } = data;

    const agreement = await getAgreement(agreementId);

    if (!agreement) {
        throw new Error('Agreement not found');
    }

    if (agreement.status === 'SIGNED') {
        throw new Error('Agreement has already been signed');
    }

    if (agreement.status === 'EXPIRED' || (agreement.expiresAt && agreement.expiresAt < new Date())) {
        await prisma.leaseAgreement.update({
            where: { id: agreementId },
            data: { status: 'EXPIRED' },
        });
        throw new Error('Agreement has expired');
    }

    // Check if this signer type has already signed
    const existingSignature = await prisma.leaseSignature.findFirst({
        where: {
            agreementId,
            signerType,
        },
    });

    if (existingSignature) {
        throw new Error(`${signerType} has already signed this agreement`);
    }

    // Create signature
    const signature = await prisma.leaseSignature.create({
        data: {
            agreementId,
            signerType,
            signerName,
            signerEmail,
            signatureData,
            signatureMethod,
            ipAddress,
            signedAt: new Date(),
        },
    });

    // Check if all parties have signed
    const allSignatures = await prisma.leaseSignature.findMany({
        where: { agreementId },
    });

    const hasLandlordSignature = allSignatures.some((s) => s.signerType === 'LANDLORD');
    const hasTenantSignature = allSignatures.some((s) => s.signerType === 'TENANT');

    if (hasLandlordSignature && hasTenantSignature) {
        // Mark agreement as signed
        await prisma.leaseAgreement.update({
            where: { id: agreementId },
            data: {
                status: 'SIGNED',
                signedAt: new Date(),
            },
        });

        // Send notification email
        try {
            await sendAgreementSignedNotification(
                'admin@example.com', // TODO: Get from settings or property manager email
                agreement.lease.tenant.name,
                agreement.lease.unit.property.address,
                agreementId
            );
        } catch (error) {
            logger.error({ error }, 'Failed to send signed notification');
        }
    }

    // Check if tenant needs an account
    let invitationToken: string | null = null;

    if (signerType === 'TENANT') {
        const tenant = agreement.lease.tenant;
        logger.info({ email: signerEmail }, 'Checking for existing user account for signer');

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: signerEmail },
        });

        if (!user) {
            logger.info('User not found, checking/creating invitation');
            // Check for existing invitation
            const existingInvitation = await prisma.tenantInvitation.findFirst({
                where: {
                    tenantId: tenant.id,
                    acceptedAt: null,
                    expiresAt: { gt: new Date() },
                },
            });

            if (existingInvitation) {
                logger.info('Found existing invitation');
                invitationToken = existingInvitation.token;
            } else {
                logger.info('Creating new invitation');
                // Create new invitation
                // We need to import createInvitation dynamically to avoid circular dependency if possible
                // Or just duplicate the logic slightly or use prisma directly

                const token = randomBytes(32).toString('hex');
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                await prisma.tenantInvitation.create({
                    data: {
                        tenantId: tenant.id,
                        email: signerEmail,
                        token,
                        expiresAt,
                    },
                });

                invitationToken = token;
            }
        } else {
            logger.info('User already exists, skipping invitation');
        }
    }

    return { signature, invitationToken };
}

export async function listAgreements(leaseId?: string) {
    return prisma.leaseAgreement.findMany({
        where: leaseId ? { leaseId } : undefined,
        include: {
            lease: {
                include: {
                    tenant: true,
                    unit: {
                        include: {
                            property: true,
                        },
                    },
                },
            },
            signatures: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function voidAgreement(id: string) {
    const agreement = await prisma.leaseAgreement.findUnique({
        where: { id },
    });

    if (!agreement) {
        throw new Error('Agreement not found');
    }

    if (agreement.status === 'SIGNED') {
        throw new Error('Cannot void a signed agreement');
    }

    return prisma.leaseAgreement.update({
        where: { id },
        data: { status: 'VOIDED' },
    });
}
