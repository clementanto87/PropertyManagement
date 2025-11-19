import { api } from '@/lib/api';

export type Tenant = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateTenantInput = {
    name: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
};

export type UpdateTenantInput = Partial<CreateTenantInput>;

export const tenantService = {
    async createTenant(data: CreateTenantInput): Promise<Tenant> {
        return api.post<Tenant>('/tenants', data);
    },

    async getTenants(params?: { page?: number; limit?: number }): Promise<{ items: Tenant[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        return api.get<{ items: Tenant[]; page: number; limit: number }>(`/tenants${query ? `?${query}` : ''}`);
    },

    async getTenant(id: string): Promise<Tenant> {
        return api.get<Tenant>(`/tenants/${id}`);
    },

    async updateTenant(id: string, data: UpdateTenantInput): Promise<Tenant> {
        return api.patch<Tenant>(`/tenants/${id}`, data);
    },

    async deleteTenant(id: string): Promise<void> {
        return api.delete(`/tenants/${id}`);
    }
};
