import { apiClient } from '../lib/api';
import { WorkOrder } from '../types';

export const workOrderService = {
  async listWorkOrders(tenantId: string, status?: string): Promise<WorkOrder[]> {
    const { data } = await apiClient.get<WorkOrder[]>(
      `/tenants/${tenantId}/work-orders`,
      { params: { status } }
    );
    return data;
  },

  async createWorkOrder(
    tenantId: string, 
    workOrderData: { 
      title: string; 
      description: string; 
      priority: 'low' | 'medium' | 'high';
      images?: string[];
    }
  ): Promise<WorkOrder> {
    const { data } = await apiClient.post<WorkOrder>(
      `/tenants/${tenantId}/work-orders`,
      workOrderData
    );
    return data;
  },

  async getWorkOrder(workOrderId: string): Promise<WorkOrder> {
    const { data } = await apiClient.get<WorkOrder>(`/work-orders/${workOrderId}`);
    return data;
  },

  async addWorkOrderComment(
    workOrderId: string,
    comment: { text: string; images?: string[] }
  ): Promise<WorkOrder> {
    const { data } = await apiClient.post<WorkOrder>(
      `/work-orders/${workOrderId}/comments`,
      comment
    );
    return data;
  },

  async uploadWorkOrderImage(
    workOrderId: string,
    imageUri: string,
    type: 'image' | 'document' = 'image'
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // or get the actual mime type
      name: `workorder-${workOrderId}-${Date.now()}.jpg`,
    } as any);

    const { data } = await apiClient.post<{ url: string }>(
      `/work-orders/${workOrderId}/upload`,
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
