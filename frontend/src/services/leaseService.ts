import { api } from '@/lib/api';

export interface Lease {
    id: string;
    tenantId: string;
    unitId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    securityDeposit: number | null;
    status: string;
    tenant?: any;
    unit?: any;
}

export const leaseService = {
    async getLease(id: string): Promise<Lease> {
        return api.get<Lease>(`/leases/${id}`);
    },

    async getLeases(): Promise<Lease[]> {
        return api.get<Lease[]>('/leases');
    },
};
