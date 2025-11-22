import { apiClient } from '../lib/api';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'OTHER';

export type Payment = {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: string;
  paidAt?: string | null;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  notes?: string | null;
  receiptNumber?: string | null;
  lease?: {
    id: string;
    tenant: {
      id: string;
      name: string;
      email?: string | null;
    };
    unit?: {
      id: string;
      unitNumber: string;
      property?: {
        id: string;
        name: string;
        address: string;
      } | null;
    } | null;
  } | null;
};

export type PaymentFilters = {
  tenantId?: string;
  leaseId?: string;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
};

export const paymentService = {
  async list(filters: PaymentFilters = {}) {
    const { data } = await apiClient.get<{ items: Payment[] }>('/payments', {
      params: filters
    });
    return data.items;
  },
  async recordPayment(id: string, payload: { paidAt: string; paymentMethod: PaymentMethod; notes?: string }) {
    const { data } = await apiClient.post<Payment>(`/payments/${id}/record`, payload);
    return data;
  }
};
