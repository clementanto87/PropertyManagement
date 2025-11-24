import { api } from '@/lib/api';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'OTHER';

export type Payment = {
    id: string;
    leaseId: string;
    amount: number;
    dueDate: string;
    paidAt?: string;
    status: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    receiptNumber?: string;
    createdAt: string;
    lease?: {
        id: string;
        tenant: {
            id: string;
            name: string;
            email: string;
        };
        unit?: {
            id: string;
            unitNumber: string;
            property?: {
                id: string;
                name: string;
                address: string;
            };
        };
    };
};

export type CreatePaymentInput = {
    leaseId: string;
    amount: number;
    dueDate: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
};

export type RecordPaymentInput = {
    paidAt: string;
    paymentMethod: PaymentMethod;
    notes?: string;
};

export const paymentService = {
    getPayments: async (filters: {
        leaseId?: string;
        tenantId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    } = {}): Promise<Payment[]> => {
        const query = new URLSearchParams(
            Object.entries(filters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value;
                return acc;
            }, {} as Record<string, string>)
        ).toString();
        const response = await api.get<{ items: Payment[] }>(`/payments?${query}`);
        return response.items;
    },

    getPayment: async (id: string): Promise<Payment> => {
        return api.get<Payment>(`/payments/${id}`);
    },

    createPayment: async (data: CreatePaymentInput): Promise<Payment> => {
        return api.post<Payment>('/payments', data);
    },

    updatePayment: async (id: string, data: Partial<CreatePaymentInput>): Promise<Payment> => {
        return api.put<Payment>(`/payments/${id}`, data);
    },

    recordPayment: async (id: string, data: RecordPaymentInput): Promise<Payment> => {
        return api.post<Payment>(`/payments/${id}/record`, data);
    },

    deletePayment: async (id: string): Promise<void> => {
        return api.delete(`/payments/${id}`);
    },

    downloadReceipt: async (id: string): Promise<Blob> => {
        const token = localStorage.getItem('token'); // Or use getAuthToken() if exported
        const response = await fetch(`${api.defaults.baseURL}/payments/${id}/receipt`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download receipt');
        }

        return response.blob();
    },
};
