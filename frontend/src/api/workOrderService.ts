import { api } from '@/lib/api';

export type WorkOrderStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export type WorkOrder = {
    id: string;
    unitId: string;
    vendorId?: string;
    title: string;
    description?: string;
    status: WorkOrderStatus;
    createdAt: string;
    updatedAt: string;
    unit?: {
        id: string;
        unitNumber: string;
        property?: {
            id: string;
            title: string;
            address: string;
        };
    };
    vendor?: {
        id: string;
        name: string;
        companyName?: string;
    };
};

export type CreateWorkOrderInput = {
    unitId: string;
    vendorId?: string;
    title: string;
    description?: string;
    status?: WorkOrderStatus;
};

export type UpdateWorkOrderInput = Partial<CreateWorkOrderInput>;

export const workOrderService = {
    async createWorkOrder(data: CreateWorkOrderInput): Promise<WorkOrder> {
        return api.post<WorkOrder>('/work-orders', data);
    },

    async getWorkOrders(params?: { page?: number; limit?: number; status?: WorkOrderStatus }): Promise<{ items: WorkOrder[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const query = queryParams.toString();
        return api.get<{ items: WorkOrder[]; page: number; limit: number }>(`/work-orders${query ? `?${query}` : ''}`);
    },

    async getWorkOrder(id: string): Promise<WorkOrder> {
        return api.get<WorkOrder>(`/work-orders/${id}`);
    },

    async updateWorkOrder(id: string, data: UpdateWorkOrderInput): Promise<WorkOrder> {
        return api.patch<WorkOrder>(`/work-orders/${id}`, data);
    },

    async deleteWorkOrder(id: string): Promise<void> {
        return api.delete(`/work-orders/${id}`);
    }
};
