import { apiClient } from '../lib/api';
import { Lease } from '../types';

export const leaseService = {
  async listByTenant(tenantId: string): Promise<Lease[]> {
    const { data } = await apiClient.get<Lease[]>(`/tenants/${tenantId}/leases`);
    return data;
  },
  
  async getActiveLease(tenantId: string): Promise<Lease | null> {
    try {
      const { data } = await apiClient.get<Lease>(`/tenants/${tenantId}/leases/active`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  async getLease(leaseId: string): Promise<Lease> {
    const { data } = await apiClient.get<Lease>(`/leases/${leaseId}`);
    return data;
  }
};
