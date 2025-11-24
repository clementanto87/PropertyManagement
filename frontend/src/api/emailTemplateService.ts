import { api } from '@/lib/api';

export type EmailTemplate = {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string;
    variables: Record<string, string>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateEmailTemplateInput = {
    name: string;
    subject: string;
    body: string;
    category: 'rent_reminder' | 'maintenance' | 'welcome' | 'lease_renewal' | 'move_out';
    variables?: Record<string, string>;
    isActive?: boolean;
};

export type UpdateEmailTemplateInput = Partial<CreateEmailTemplateInput>;

export const emailTemplateService = {
    getTemplates: async (filters?: { category?: string; isActive?: boolean }): Promise<{ items: EmailTemplate[] }> => {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

        const query = params.toString();
        return api.get<{ items: EmailTemplate[] }>(`/email-templates${query ? `?${query}` : ''}`);
    },

    getTemplate: async (id: string): Promise<EmailTemplate> => {
        return api.get<EmailTemplate>(`/email-templates/${id}`);
    },

    createTemplate: async (data: CreateEmailTemplateInput): Promise<EmailTemplate> => {
        return api.post<EmailTemplate>('/email-templates', data);
    },

    updateTemplate: async (id: string, data: UpdateEmailTemplateInput): Promise<EmailTemplate> => {
        return api.put<EmailTemplate>(`/email-templates/${id}`, data);
    },

    deleteTemplate: async (id: string): Promise<void> => {
        return api.delete(`/email-templates/${id}`);
    },
};
