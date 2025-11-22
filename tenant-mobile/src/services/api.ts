import axios from 'axios';
import { storage } from './storage';

const API_URL = 'http://192.168.1.125:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = await storage.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authAPI = {
    async sendOTP(email: string) {
        const response = await api.post('/auth/tenant/login', { email });
        return response.data;
    },

    async verifyOTP(email: string, otp: string) {
        const response = await api.post('/auth/tenant/verify', { email, otp });
        return response.data;
    },
};

// Tenant endpoints
export const tenantAPI = {
    async getProfile() {
        const response = await api.get('/tenant/profile');
        return response.data;
    },

    async updateProfile(data: any) {
        const response = await api.put('/tenant/profile', data);
        return response.data;
    },

    async getPayments() {
        const response = await api.get('/tenant/payments');
        return response.data;
    },

    async getMaintenanceRequests() {
        const response = await api.get('/tenant/maintenance');
        return response.data;
    },

    async createMaintenanceRequest(data: any) {
        const response = await api.post('/tenant/maintenance', data);
        return response.data;
    },

    async getDocuments() {
        const response = await api.get('/tenant/documents');
        return response.data;
    },

    async getDashboard() {
        const response = await api.get('/tenant/dashboard');
        return response.data;
    },
};

export default api;
