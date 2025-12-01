import { apiClient } from '../lib/api';

export type Communication = {
  id: string;
  tenantId: string;
  summary: string;
  content: string;
  channel: string;
  type: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
};

export const communicationService = {
  async listByTenant(tenantId: string) {
    const { data } = await apiClient.get<Communication[]>(`/communications/tenants/${tenantId}/communications`);
    return data;
  }
};
