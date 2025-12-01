import { apiClient } from '../lib/api';
import { Document } from '../types';

export const documentService = {
  async listByTenant(tenantId: string): Promise<Document[]> {
    const { data } = await apiClient.get<Document[]>(`/tenants/${tenantId}/documents`);
    return data;
  },

  async getDocument(documentId: string): Promise<Document> {
    const { data } = await apiClient.get<Document>(`/documents/${documentId}`);
    return data;
  },

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async uploadDocument(
    tenantId: string,
    file: { uri: string; name: string; type: string },
    metadata: { type: string; leaseId?: string }
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    formData.append('type', metadata.type);
    if (metadata.leaseId) {
      formData.append('leaseId', metadata.leaseId);
    }

    const { data } = await apiClient.post<Document>(
      `/tenants/${tenantId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/documents/${documentId}`);
  },
};
