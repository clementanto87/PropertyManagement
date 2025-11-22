import { apiClient } from '../lib/api';
import { Payment, PaymentFilters } from '../types';

export const paymentService = {
  async listPayments(tenantId: string, filters?: PaymentFilters): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>(`/tenants/${tenantId}/payments`, {
      params: filters
    });
    return data;
  },
  
  async recordPayment(tenantId: string, paymentData: {
    amount: number;
    date: string;
    method: string;
    reference: string;
    description?: string;
  }): Promise<Payment> {
    const { data } = await apiClient.post<Payment>(
      `/tenants/${tenantId}/payments`,
      paymentData
    );
    return data;
  },
  
  async getPayment(paymentId: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${paymentId}`);
    return data;
  },
  
  async getPaymentReceipt(paymentId: string): Promise<Blob> {
    const response = await apiClient.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
