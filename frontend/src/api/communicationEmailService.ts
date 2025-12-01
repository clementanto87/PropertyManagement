import { api } from '@/lib/api';

export type SendEmailInput = {
    tenantId: string;
    templateId?: string;
    subject: string;
    body: string;
    variables?: Record<string, string>;
    logAsCommunication?: boolean;
};

export const communicationEmailService = {
    sendEmail: async (data: SendEmailInput): Promise<{ success: boolean; sentTo: string }> => {
        return api.post<{ success: boolean; sentTo: string }>('/communications/send-email', data);
    },
};
