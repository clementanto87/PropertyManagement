import { apiClient } from '../lib/api';
import { Communication } from '../types';

export const communicationService = {
  async listByTenant(tenantId: string): Promise<Communication[]> {
    const { data } = await apiClient.get<Communication[]>(
      `/tenants/${tenantId}/communications`
    );
    return data;
  },

  async getCommunication(communicationId: string): Promise<Communication> {
    const { data } = await apiClient.get<Communication>(
      `/communications/${communicationId}`
    );
    return data;
  },

  async markAsRead(communicationId: string): Promise<Communication> {
    const { data } = await apiClient.patch<Communication>(
      `/communications/${communicationId}/read`,
      { readAt: new Date().toISOString() }
    );
    return data;
  },

  async sendMessage(
    tenantId: string,
    message: { subject: string; body: string; attachments?: string[] }
  ): Promise<Communication> {
    const { data } = await apiClient.post<Communication>(
      `/tenants/${tenantId}/communications`,
      message
    );
    return data;
  },

  async uploadAttachment(
    file: { uri: string; name: string; type: string },
    type: 'image' | 'document' = 'document'
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    const { data } = await apiClient.post<{ url: string }>(
      '/communications/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },
};
