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

export const sendNewMessageNotification = async (
    recipientEmail: string,
    senderName: string,
    messagePreview: string,
    isToTenant: boolean
) => {
    const subject = isToTenant
        ? `New message from ${senderName}`
        : `New message from ${senderName} (Tenant)`;

    const body = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You have a new message</h2>
            <p><strong>From:</strong> ${senderName}</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;">${messagePreview}</p>
            </div>
            <p>Log in to your dashboard to reply.</p>
        </div>
    `;

    await sendEmail({
        to: recipientEmail,
        subject,
        html: body,
    });
};
