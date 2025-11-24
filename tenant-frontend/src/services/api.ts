import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('tenant_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem('tenant_token');
            localStorage.removeItem('tenant_user');
            
            // Only redirect if not already on login page
            if (window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
            }
        }
        
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export const auth = {
    login: (email: string) => api.post('/auth/tenant/login', { email }),
    verify: (email: string, otp: string) => api.post('/auth/tenant/verify', { email, otp }),
};

export const tenant = {
    getDashboard: () => api.get('/tenant/dashboard'),
    getPayments: () => api.get('/tenant/payments'),
    getMaintenance: () => api.get('/tenant/maintenance'),
    createMaintenance: (data: { title: string; description: string; priority: string }) =>
        api.post('/tenant/maintenance', data),
    getDocuments: () => api.get('/tenant/documents'),

    // Community
    getCommunityPosts: () => api.get('/tenant/community'),
    createCommunityPost: (data: any) => api.post('/tenant/community', data),

    // Amenities
    getAmenities: () => api.get('/tenant/amenities'),
    getBookings: () => api.get('/tenant/amenities/bookings'),
    createBooking: (data: any) => api.post('/tenant/amenities/book', data),

    // Profile
    getProfile: () => api.get('/tenant/profile'),
    updateProfile: (data: { name: string; phone?: string; emergencyContact?: string }) =>
        api.put('/tenant/profile', data),
};

export default api;
