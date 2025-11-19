// src/features/financials/financialService.ts
import { api } from '@/lib/api';
import { Payment, Expense, FinancialMetrics } from '../../types/financials';

export const financialService = {
  // Payments
  getPayments: async (filters = {}): Promise<Payment[]> => {
    const response = await api.get('/api/payments', { params: filters });
    return response.data;
  },

  createPayment: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    const response = await api.post('/api/payments', paymentData);
    return response.data;
  },

  // Expenses
  getExpenses: async (filters = {}): Promise<Expense[]> => {
    const response = await api.get('/api/expenses', { params: filters });
    return response.data;
  },

  createExpense: async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await api.post('/api/expenses', expenseData);
    return response.data;
  },

  // Metrics
  getFinancialMetrics: async (): Promise<FinancialMetrics> => {
    const response = await api.get('/api/financials/metrics');
    return response.data;
  }
};