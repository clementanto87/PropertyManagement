// src/features/financials/financialService.ts
import { api } from '@/lib/api';
import { Payment, Expense, FinancialMetrics } from '../../types/financials';

export const financialService = {
  // Payments
  getPayments: async (filters: Record<string, any> = {}): Promise<Payment[]> => {
    const query = new URLSearchParams(filters).toString();
    return api.get<Payment[]>(`/payments?${query}`);
  },

  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    return api.post<Payment>('/payments', paymentData);
  },

  // Expenses
  getExpenses: async (filters: Record<string, any> = {}): Promise<Expense[]> => {
    const query = new URLSearchParams(filters).toString();
    return api.get<Expense[]>(`/expenses?${query}`);
  },

  createExpense: async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    return api.post<Expense>('/expenses', expenseData);
  },

  // Metrics
  getFinancialMetrics: async (): Promise<FinancialMetrics> => {
    return api.get<FinancialMetrics>('/financials/metrics');
  }
};