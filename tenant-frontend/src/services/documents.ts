import { apiClient } from '../lib/api';

export type Document = {
  id: string;
  title: string;
  url: string;
  type?: string | null;
  createdAt: string;
  leaseId?: string | null;
  propertyId?: string | null;
};

export const documentService = {
  async listByTenant(tenantId: string) {
    const { data } = await apiClient.get<{ items: Document[] }>('/documents', {
      params: { tenantId }
    });
    return data.items;
  }
};
