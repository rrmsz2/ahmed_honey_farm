import axios from 'axios';

const TOKEN_KEY = 'admin_token';
const baseURL = `${(process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '')}/api`;

export const api = axios.create({ baseURL, timeout: 20000 });

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token && config.url?.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && url.startsWith('/admin') && url !== '/admin/login') {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

/** Human-readable message from an API error. */
export const errorMessage = (error, fallback) => {
  if (!error.response) return fallback || 'تعذر الاتصال بالخادم';
  const detail = error.response.data?.detail;
  return typeof detail === 'string' ? detail : fallback || 'حدث خطأ غير متوقع';
};
