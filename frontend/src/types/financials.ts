// src/types/financials.ts
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
export type ExpenseCategory = 'MAINTENANCE' | 'UTILITIES' | 'TAXES' | 'INSURANCE' | 'OTHER';

export interface Payment {
  id: string;
  tenantName: string;
  property: string;
  unit: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  type: 'RENT' | 'FEE' | 'DEPOSIT';
  category?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  property: string;
  description: string;
  receipt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface FinancialMetrics {
  totalCollected: number;
  totalOutstanding: number;
  expenses: number;
  netIncome: number;
}