import { api } from '@/lib/api';

export type LeaseStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'PENDING';

export type Lease = {
    id: string;
    unitId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    securityDeposit?: number;
    status: LeaseStatus;
    createdAt: string;
    updatedAt: string;
    // Expanded relations often returned by backend
    unit?: {
        id: string;
        unitNumber: string;
        property?: {
            id: string;
            name: string;
            address: string;
        };
    };
    tenant?: {
        id: string;
        name: string;
        email: string;
    };
};

export type CreateLeaseInput = {
    unitId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    securityDeposit?: number;
    status?: LeaseStatus;
};

export type UpdateLeaseInput = Partial<CreateLeaseInput>;

export const leaseService = {
    async getLeases(params?: { page?: number; limit?: number; unitId?: string; tenantId?: string }): Promise<{ items: Lease[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.unitId) queryParams.append('unitId', params.unitId);
        if (params?.tenantId) queryParams.append('tenantId', params.tenantId);

        const query = queryParams.toString();
        return api.get<{ items: Lease[]; page: number; limit: number }>(`/leases${query ? `?${query}` : ''}`);
    },

    async getLease(id: string): Promise<Lease> {
        return api.get<Lease>(`/leases/${id}`);
    },

    async createLease(data: CreateLeaseInput): Promise<Lease> {
        return api.post<Lease>('/leases', data);
    },

    async updateLease(id: string, data: UpdateLeaseInput): Promise<Lease> {
        return api.patch<Lease>(`/leases/${id}`, data);
    },

    async deleteLease(id: string): Promise<void> {
        return api.delete(`/leases/${id}`);
    }
};
