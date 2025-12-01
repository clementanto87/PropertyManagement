import { api } from '@/lib/api';

export type HouseOwner = {
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

export type CreateHouseOwnerInput = {
    name: string;
    contact?: string;
    rateInfo?: string;
    insured?: boolean;
    propertyIds?: string[];
    unitIds?: string[];
};

export type UpdateHouseOwnerInput = Partial<CreateHouseOwnerInput>;

export const houseOwnerService = {
    async createHouseOwner(data: CreateHouseOwnerInput): Promise<HouseOwner> {
        return api.post<HouseOwner>('/houseowners', data);
    },

    async getHouseOwners(params?: { page?: number; limit?: number; search?: string }): Promise<{ items: HouseOwner[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const query = queryParams.toString();
        return api.get<{ items: HouseOwner[]; page: number; limit: number }>(`/houseowners${query ? `?${query}` : ''}`);
    },

    async getHouseOwner(id: string): Promise<HouseOwner> {
        return api.get<HouseOwner>(`/houseowners/${id}`);
    },

    async updateHouseOwner(id: string, data: UpdateHouseOwnerInput): Promise<HouseOwner> {
        return api.patch<HouseOwner>(`/houseowners/${id}`, data);
    },

    async deleteHouseOwner(id: string): Promise<void> {
        return api.delete(`/houseowners/${id}`);
    }
};
