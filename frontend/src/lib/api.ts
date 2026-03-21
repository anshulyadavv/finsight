import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const tokens = data.data.tokens ?? data.data;
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  summary:   (month?: string) => api.get('/dashboard/summary',    { params: { month } }),
  overview:  (month?: string) => api.get('/dashboard/overview',   { params: { month } }),
  moneyFlow: (months = 6)     => api.get('/dashboard/money-flow', { params: { months } }),
  wealth:    ()               => api.get('/dashboard/wealth'),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const txApi = {
  list:   (params?: Record<string, unknown>) => api.get('/transactions', { params }),
  create: (data: Record<string, unknown>)    => api.post('/transactions', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/transactions/${id}`, data),
  remove: (id: string)                       => api.delete(`/transactions/${id}`),
};

// ── Insights ──────────────────────────────────────────────────────────────────
export const insightsApi = {
  list:    ()          => api.get('/insights'),
  dismiss: (id: string) => api.patch(`/insights/${id}/dismiss`),
};

// ── Anomalies ──────────────────────────────────────────────────────────────────
export const anomaliesApi = {
  list:    ()           => api.get('/anomalies'),
  resolve: (id: string) => api.patch(`/anomalies/${id}/resolve`),
};

// ── Predictions ────────────────────────────────────────────────────────────────
export const predictionsApi = {
  get: () => api.get('/predictions'),
};

// ── Budgets ────────────────────────────────────────────────────────────────────
export const budgetsApi = {
  list:   (month?: string)                          => api.get('/budgets', { params: { month } }),
  create: (data: Record<string, unknown>)           => api.post('/budgets', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/budgets/${id}`, data),
  remove: (id: string)                              => api.delete(`/budgets/${id}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get('/categories'),
};
