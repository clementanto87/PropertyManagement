import { api } from '@/lib/api';

export type Document = {
    id: string;
    title: string;
    type: string;
    url: string;
    propertyId?: string;
    leaseId?: string;
    unitId?: string;
    createdAt: string;
};

export type CreateDocumentInput = {
    title: string;
    type: string;
    url: string;
    propertyId?: string;
    leaseId?: string;
    unitId?: string;
};

export const documentService = {
    getDocuments: async (filters: {
        propertyId?: string;
        tenantId?: string;
        leaseId?: string;
        unitId?: string;
    } = {}): Promise<Document[]> => {
        const query = new URLSearchParams(
            Object.entries(filters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value;
                return acc;
            }, {} as Record<string, string>)
        ).toString();
        const response = await api.get<{ items: Document[] }>(`/documents?${query}`);
        return response.items;
    },

    createDocument: async (data: CreateDocumentInput & { file: File }): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('title', data.title);
        formData.append('type', data.type);
        if (data.propertyId) formData.append('propertyId', data.propertyId);
        if (data.leaseId) formData.append('leaseId', data.leaseId);
        if (data.unitId) formData.append('unitId', data.unitId);

        // No need to set Content-Type, fetch handles it for FormData
        return api.post<Document>('/documents/upload', formData);
    },

    deleteDocument: async (id: string): Promise<void> => {
        return api.delete(`/documents/${id}`);
    },

    getDownloadUrl: (id: string) => {
        return `${api.defaults.baseURL}/documents/${id}/download`;
    }
};
