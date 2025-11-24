import { sendEmail } from '../../services/email/emailService';
import { replaceTemplateVariables } from '../email-templates/service';
import { prisma } from '../../db/prisma';

export type SendEmailInput = {
    tenantId: string;
    templateId?: string;
    subject: string;
    body: string;
    variables?: Record<string, string>;
    logAsCommunication?: boolean;
};

export const sendEmailToTenant = async (data: SendEmailInput, userId: string) => {
    // Get tenant details
    const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
    });

    if (!tenant || !tenant.email) {
        throw new Error('Tenant not found or has no email');
    }

    // Replace variables in subject and body
    let subject = data.subject;
    let body = data.body;

    if (data.variables) {
        subject = replaceTemplateVariables(subject, data.variables);
        body = replaceTemplateVariables(body, data.variables);
    }

    // Send email
    await sendEmail({
        to: tenant.email,
        subject,
        html: body.replace(/\n/g, '<br>'),
    });

    // Log as communication if requested
    if (data.logAsCommunication) {
        await prisma.communication.create({
            data: {
                tenantId: data.tenantId,
                userId,
                type: 'email',
                channel: 'Email',
                summary: subject,
                content: body,
                followUpRequired: false,
            },
        });
    }

    return {
        success: true,
        sentTo: tenant.email,
    };
};
