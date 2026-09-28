import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dpms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    const isLoginCall = error.config?.url?.startsWith('/auth/');
    const tenantInactive = status === 403 && data?.errors?.code === 'TENANT_INACTIVE';

    if (!isLoginCall && (status === 401 || tenantInactive)) {
      if (tenantInactive) {
        sessionStorage.setItem('dpms_login_notice', data.message);
      }
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
