import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
