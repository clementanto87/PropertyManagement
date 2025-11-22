import { apiClient } from '../lib/api';

export type WorkOrderStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export type WorkOrder = {
  id: string;
  unitId: string;
  title: string;
  description?: string | null;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt: string;
};

export const workOrderService = {
  async list(params: { unitId?: string; status?: WorkOrderStatus } = {}) {
    const { data } = await apiClient.get<{ items: WorkOrder[] }>('/work-orders', {
      params: params.unitId ? { ...params, limit: 10 } : undefined
    });
    return data.items;
  },
  async create(payload: { unitId: string; title: string; description?: string }) {
    const { data } = await apiClient.post<WorkOrder>('/work-orders', payload);
    return data;
  }
};
