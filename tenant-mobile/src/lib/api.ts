import axios from 'axios';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// TODO: inject tenant auth token/session headers when mobile auth is implemented.
apiClient.interceptors.request.use((config) => {
  return config;
});
