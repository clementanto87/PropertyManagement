import { api } from '@/lib/api';

export type Vendor = {
    id: string;
    name: string;
    contact?: string;
    rateInfo?: string;
    insured?: boolean;
    createdAt: string;
    updatedAt: string;
    // Frontend specific fields that might be parsed from contact or added later
    companyName?: string;
    category?: string;
    email?: string;
    phone?: string;
    address?: string;
    properties?: { id: string; name: string }[];
    units?: { id: string; unitNumber: string }[];
};

export type CreateVendorInput = {
    name: string;
    contact?: string;
    rateInfo?: string;
    insured?: boolean;
    propertyIds?: string[];
    unitIds?: string[];
};

export type UpdateVendorInput = Partial<CreateVendorInput>;

export const vendorService = {
    async createVendor(data: CreateVendorInput): Promise<Vendor> {
        return api.post<Vendor>('/vendors', data);
    },

    async getVendors(params?: { page?: number; limit?: number; search?: string }): Promise<{ items: Vendor[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const query = queryParams.toString();
        return api.get<{ items: Vendor[]; page: number; limit: number }>(`/vendors${query ? `?${query}` : ''}`);
    },

    async getVendor(id: string): Promise<Vendor> {
        return api.get<Vendor>(`/vendors/${id}`);
    },

    async updateVendor(id: string, data: UpdateVendorInput): Promise<Vendor> {
        return api.patch<Vendor>(`/vendors/${id}`, data);
    },

    async deleteVendor(id: string): Promise<void> {
        return api.delete(`/vendors/${id}`);
    }
};
