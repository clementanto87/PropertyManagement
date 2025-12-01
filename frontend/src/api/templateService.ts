import { api } from '@/lib/api';

export type TemplateType = 'EMAIL' | 'AGREEMENT' | 'INVOICE';

export interface Template {
    id: string;
    type: TemplateType;
    name: string;
    subject?: string;
    body: string;
    category: string;
    variables: Record<string, string>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplateData {
    type: TemplateType;
    name: string;
    subject?: string;
    body: string;
    category: string;
    variables: Record<string, string>;
    isActive?: boolean;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> { }

export const templateService = {
    getTemplates: async (params: { type?: TemplateType; category?: string; isActive?: boolean }) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.category) queryParams.append('category', params.category);
        if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

        const queryString = queryParams.toString();
        const url = `/templates${queryString ? `?${queryString}` : ''}`;

        return api.get<{ items: Template[] }>(url);
    },

    getTemplate: async (id: string) => {
        return api.get<Template>(`/templates/${id}`);
    },

    createTemplate: async (data: CreateTemplateData) => {
        return api.post<Template>('/templates', data);
    },

    updateTemplate: async (id: string, data: UpdateTemplateData) => {
        return api.put<Template>(`/templates/${id}`, data);
    },

    deleteTemplate: async (id: string) => {
        return api.delete(`/templates/${id}`);
    },
};
