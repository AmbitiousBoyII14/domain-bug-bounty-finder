import axios from 'axios';
import { useAuthStore } from '../store/useStore';

// Use VITE_API_URL in production, fall back to /api for local dev
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      const networkError = new Error('Network error — backend may be offline');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    const contentType = error.response.headers?.['content-type'] || '';
    if (contentType.includes('text/html')) {
      const htmlError = new Error(`Server returned HTML (${error.response.status}) instead of JSON`);
      (htmlError as any).status = error.response.status;
      (htmlError as any).isHtmlError = true;
      return Promise.reject(htmlError);
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          if (data?.data?.accessToken) {
            useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch { useAuthStore.getState().logout(); }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
