import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';
import type {
    ApiResponse,
    ApiError,
    LoginResponse,
    VerifyOTPResponse,
    TenantProfile,
    UpdateProfileRequest,
    DashboardData,
    Payment,
    MaintenanceRequest,
    CreateMaintenanceRequest,
    Document,
    UploadImageResponse,
} from '../types/api';

// API Configuration
const API_URL = __DEV__
    ? 'http://192.168.1.125:3000/api'  // Development - update with your local IP
    : 'https://your-production-api.com/api';  // Production

const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Add auth token and logging
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = await storage.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (__DEV__) {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle errors and logging
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (__DEV__) {
            console.log('✅ API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }
        return response;
    },
    async (error: AxiosError<ApiError>) => {
        // Log error in development
        if (__DEV__) {
            console.error('❌ API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
            });
        }

        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            // Unauthorized - clear token and redirect to login
            if (status === 401) {
                await storage.removeToken();
                // The AuthContext will handle the redirect
            }

            // Return formatted error
            return Promise.reject({
                success: false,
                error: data?.error || 'API Error',
                message: data?.message || error.message,
                statusCode: status,
            } as ApiError);
        }

        // Network error
        if (error.request) {
            return Promise.reject({
                success: false,
                error: 'Network Error',
                message: 'Unable to connect to server. Please check your internet connection.',
            } as ApiError);
        }

        // Other errors
        return Promise.reject({
            success: false,
            error: 'Unknown Error',
            message: error.message || 'An unexpected error occurred',
        } as ApiError);
    }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<any>): T => {
    // Check if response has the wrapped format { success: true, data: {...} }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        return response.data.data;
    }
    // Otherwise return the data directly
    return response.data;
};

// Auth endpoints
export const authAPI = {
    async sendOTP(email: string): Promise<LoginResponse> {
        const response = await api.post<ApiResponse<LoginResponse>>(
            '/auth/tenant/login',
            { email }
        );
        return handleResponse(response);
    },

    async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
        const response = await api.post<ApiResponse<VerifyOTPResponse>>(
            '/auth/tenant/verify',
            { email, otp }
        );
        return handleResponse(response);
    },
};

// Tenant endpoints
export const tenantAPI = {
    async getProfile(): Promise<TenantProfile> {
        const response = await api.get<ApiResponse<TenantProfile>>('/tenant/profile');
        return handleResponse(response);
    },

    async updateProfile(data: UpdateProfileRequest): Promise<TenantProfile> {
        const response = await api.put<ApiResponse<TenantProfile>>(
            '/tenant/profile',
            data
        );
        return handleResponse(response);
    },

    async uploadProfilePhoto(imageUri: string): Promise<UploadImageResponse> {
        const formData = new FormData();
        formData.append('photo', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        } as any);

        const response = await api.post<ApiResponse<UploadImageResponse>>(
            '/tenant/profile/photo',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return handleResponse(response);
    },

    async getDashboard(): Promise<DashboardData> {
        const response = await api.get('/tenant/dashboard');
        const data = handleResponse<any>(response);

        // Map the backend response to our expected format
        // Backend returns: { balance, leaseStatus, nextDueDate, openRequests, recentActivity, tenantName }
        // We need: { tenant, nextPayment, recentPayments, activeMaintenanceRequests, stats, ... }

        return {
            tenant: {
                id: 0,
                userId: 0,
                propertyId: 0,
                unitId: 0,
                firstName: data.tenantName?.split(' ')[0] || '',
                lastName: data.tenantName?.split(' ').slice(1).join(' ') || '',
                email: '',
                phone: '',
                moveInDate: '',
                unit: {
                    id: 0,
                    unitNumber: '1',
                    bedrooms: 2,
                    bathrooms: 1,
                    property: {
                        id: 0,
                        name: 'Mordern Large House',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        type: 'house'
                    }
                }
            },
            nextPayment: data.nextDueDate ? {
                id: 0,
                amount: data.balance || 0,
                dueDate: data.nextDueDate,
                status: 'PENDING' as const,
                type: 'RENT' as const
            } : undefined,
            recentPayments: [],
            activeMaintenanceRequests: [],
            upcomingEvents: [],
            announcements: [],
            stats: {
                onTimePayments: 0,
                totalPayments: 0,
                activeRequests: data.openRequests || 0,
                unreadMessages: 0
            },
            activities: [
                // Mock activities for now - in a real app, we'd fetch these or synthesize from other data
                ...(data.nextDueDate ? [{
                    id: 'pay-1',
                    type: 'payment' as const,
                    title: 'Rent Due Soon',
                    description: `Upcoming rent payment of $${data.balance}`,
                    timestamp: new Date().toISOString(),
                    icon: 'card',
                    gradient: ['#EF4444', '#DC2626'],
                    actionLabel: 'Pay Now',
                    status: 'PENDING'
                }] : []),
                ...(data.openRequests > 0 ? [{
                    id: 'maint-1',
                    type: 'maintenance' as const,
                    title: 'Maintenance Update',
                    description: `${data.openRequests} active maintenance request${data.openRequests > 1 ? 's' : ''}`,
                    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    icon: 'build',
                    gradient: ['#F59E0B', '#D97706'],
                    actionLabel: 'View Status',
                    status: 'IN_PROGRESS'
                }] : []),
                {
                    id: 'ann-1',
                    type: 'announcement' as const,
                    title: 'Community Event',
                    description: 'Summer BBQ this Saturday at the pool area!',
                    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    icon: 'megaphone',
                    gradient: ['#8B5CF6', '#7C3AED'],
                },
                {
                    id: 'doc-1',
                    type: 'document' as const,
                    title: 'New Document',
                    description: 'Lease renewal agreement added to your documents',
                    timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
                    icon: 'document-text',
                    gradient: ['#3B82F6', '#2563EB'],
                    actionLabel: 'View Document'
                }
            ]
        };
    },

    async getPayments(): Promise<Payment[]> {
        const response = await api.get<ApiResponse<Payment[]>>('/tenant/payments');
        return handleResponse(response);
    },

    async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
        const response = await api.get<ApiResponse<MaintenanceRequest[]>>(
            '/tenant/maintenance'
        );
        return handleResponse(response);
    },

    async createMaintenanceRequest(
        data: CreateMaintenanceRequest
    ): Promise<MaintenanceRequest> {
        const response = await api.post<ApiResponse<MaintenanceRequest>>(
            '/tenant/maintenance',
            data
        );
        return handleResponse(response);
    },

    async uploadMaintenanceImage(imageUri: string): Promise<UploadImageResponse> {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `maintenance-${Date.now()}.jpg`,
        } as any);

        const response = await api.post<ApiResponse<UploadImageResponse>>(
            '/tenant/maintenance/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return handleResponse(response);
    },

    async uploadDocument(fileUri: string, name: string, type: string, category: string, description?: string): Promise<Document> {
        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            type: type,
            name: name,
        } as any);
        formData.append('category', category);
        if (description) {
            formData.append('description', description);
        }

        const response = await api.post<ApiResponse<Document>>(
            '/tenant/documents/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return handleResponse(response);
    },

    async getDocuments(): Promise<Document[]> {
        const response = await api.get<ApiResponse<any[]>>('/tenant/documents');
        const data = handleResponse<any[]>(response);

        // Map backend response to frontend Document interface
        return data.map(doc => ({
            id: doc.id,
            name: doc.title || doc.name || 'Untitled Document',
            type: doc.type || 'application/octet-stream',
            category: (doc.category || 'OTHER').toUpperCase(),
            url: doc.url,
            size: doc.size || 0,
            uploadedAt: doc.createdAt || doc.uploadedAt || new Date().toISOString(),
            uploadedBy: doc.uploadedBy || 'System',
        }));
    },

    async downloadDocument(documentId: number): Promise<string> {
        const response = await api.get<ApiResponse<{ url: string }>>(
            `/tenant/documents/${documentId}/download`
        );
        return handleResponse<{ url: string }>(response).url;
    },
};

export default api;
