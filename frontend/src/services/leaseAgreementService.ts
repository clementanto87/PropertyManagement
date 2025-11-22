import { api } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

const API_URL = api.defaults.baseURL;

export interface LeaseAgreement {
    id: string;
    leaseId: string;
    templateContent: string;
    status: 'DRAFT' | 'PENDING' | 'SIGNED' | 'EXPIRED' | 'VOIDED';
    sentAt: string | null;
    signedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    lease?: any;
    signatures?: LeaseSignature[];
}

export interface LeaseSignature {
    id: string;
    agreementId: string;
    signerType: 'LANDLORD' | 'TENANT';
    signerName: string;
    signerEmail: string;
    signatureData: string | null;
    signatureMethod: 'TYPED' | 'DRAWN';
    ipAddress: string | null;
    signedAt: string | null;
    createdAt: string;
}

export interface CreateAgreementData {
    leaseId: string;
    templateContent: string;
    expiresAt?: string;
}

export interface SignAgreementData {
    signerType: 'LANDLORD' | 'TENANT';
    signerName: string;
    signerEmail: string;
    signatureData?: string;
    signatureMethod: 'TYPED' | 'DRAWN';
}

export const leaseAgreementService = {
    async createAgreement(data: CreateAgreementData): Promise<LeaseAgreement> {
        return api.post<LeaseAgreement>('/lease-agreements', data);
    },

    async getAgreements(leaseId?: string): Promise<LeaseAgreement[]> {
        const query = leaseId ? `?leaseId=${leaseId}` : '';
        return api.get<LeaseAgreement[]>(`/lease-agreements${query}`);
    },

    async getAgreement(id: string): Promise<LeaseAgreement> {
        return api.get<LeaseAgreement>(`/lease-agreements/${id}`);
    },

    async sendForSignature(id: string, tenantEmail: string): Promise<LeaseAgreement> {
        return api.post<LeaseAgreement>(`/lease-agreements/${id}/send`, {
            tenantEmail,
        });
    },

    async signAgreement(id: string, data: SignAgreementData): Promise<LeaseSignature> {
        return api.post<LeaseSignature>(`/lease-agreements/${id}/sign`, data);
    },

    async voidAgreement(id: string): Promise<LeaseAgreement> {
        return api.post<LeaseAgreement>(`/lease-agreements/${id}/void`, {});
    },

    async downloadPDF(agreementId: string): Promise<Blob> {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/pdf/lease-agreement/${agreementId}`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        if (!response.ok) throw new Error('Failed to download PDF');
        return response.blob();
    },

    async previewPDF(leaseId: string): Promise<Blob> {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/pdf/lease/${leaseId}/preview`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        if (!response.ok) throw new Error('Failed to preview PDF');
        return response.blob();
    },
};
