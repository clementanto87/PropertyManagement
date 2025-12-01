import { api } from '@/lib/api';

export type CareTaker = {
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

export type CreateCareTakerInput = {
    name: string;
    contact?: string;
    rateInfo?: string;
    insured?: boolean;
    propertyIds?: string[];
    unitIds?: string[];
};

export type UpdateCareTakerInput = Partial<CreateCareTakerInput>;

export const careTakerService = {
    async createCareTaker(data: CreateCareTakerInput): Promise<CareTaker> {
        return api.post<CareTaker>('/caretakers', data);
    },

    async getCareTakers(params?: { page?: number; limit?: number; search?: string }): Promise<{ items: CareTaker[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const query = queryParams.toString();
        return api.get<{ items: CareTaker[]; page: number; limit: number }>(`/caretakers${query ? `?${query}` : ''}`);
    },

    async getCareTaker(id: string): Promise<CareTaker> {
        return api.get<CareTaker>(`/caretakers/${id}`);
    },

    async updateCareTaker(id: string, data: UpdateCareTakerInput): Promise<CareTaker> {
        return api.patch<CareTaker>(`/caretakers/${id}`, data);
    },

    async deleteCareTaker(id: string): Promise<void> {
        return api.delete(`/caretakers/${id}`);
    }
};
