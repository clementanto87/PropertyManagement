import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// TODO: plug auth tokens once the tenant auth flow is wired.
apiClient.interceptors.request.use((config) => {
  return config;
});
