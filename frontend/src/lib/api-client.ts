import axios, { InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json, text/plain, */*',
  },
});

// Request interceptor to attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If we got a 401 on a protected endpoint (not on login itself)
      const url = error.config?.url || '';
      if (!url.includes('/api/auth/login')) {
        storage.removeToken();
        // Dispatch custom event so AuthContext can clean up state smoothly
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
