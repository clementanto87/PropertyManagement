import { apiClient } from '../lib/api';

export type Lease = {
  id: string;
  tenantId: string;
  unitId: string;
  rentAmount: number;
  securityDeposit?: number | null;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'PENDING';
  unit?: {
    id: string;
    unitNumber: string;
    property?: {
      id: string;
      name: string;
      address: string;
    } | null;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paidAt?: string | null;
  }>;
};

export const leaseService = {
  async listByTenant(tenantId: string) {
    const { data } = await apiClient.get<{ items: Lease[] }>('/leases', {
      params: { tenantId, limit: 5 }
    });
    return data.items;
  },
  async getActiveLease(tenantId: string) {
    const leases = await leaseService.listByTenant(tenantId);
    return leases.find((lease) => lease.status === 'ACTIVE') ?? leases[0] ?? null;
  },
  async getLease(id: string) {
    const { data } = await apiClient.get<Lease>(`/leases/${id}`);
    return data;
  }
};
