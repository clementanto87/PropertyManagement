import { api } from '@/lib/api';

export type Expense = {
    id: string;
    propertyId: string;
    amount: number;
    category: string;
    note?: string;
    receiptUrl?: string;
    incurredAt: string;
    createdAt: string;
    updatedAt: string;
    property?: {
        title: string;
        address: string;
    };
};

export type CreateExpenseInput = {
    propertyId: string;
    amount: number;
    category: string;
    note?: string;
    receiptUrl?: string;
    incurredAt: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export const expenseService = {
    async createExpense(data: CreateExpenseInput): Promise<Expense> {
        return api.post<Expense>('/expenses', data);
    },

    async getExpenses(params?: { page?: number; limit?: number; propertyId?: string; startDate?: string; endDate?: string }): Promise<{ items: Expense[]; page: number; limit: number }> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.propertyId) queryParams.append('propertyId', params.propertyId);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const query = queryParams.toString();
        return api.get<{ items: Expense[]; page: number; limit: number }>(`/expenses${query ? `?${query}` : ''}`);
    },

    async getExpense(id: string): Promise<Expense> {
        return api.get<Expense>(`/expenses/${id}`);
    },

    async updateExpense(id: string, data: UpdateExpenseInput): Promise<Expense> {
        return api.patch<Expense>(`/expenses/${id}`, data);
    },

    async deleteExpense(id: string): Promise<void> {
        return api.delete(`/expenses/${id}`);
    }
};
