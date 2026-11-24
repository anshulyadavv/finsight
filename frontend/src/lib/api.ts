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
  list:        ()           => api.get('/insights'),
  dismiss:     (id: string)  => api.patch(`/insights/${id}/dismiss`),
  purgeStale:  ()           => api.delete('/insights/purge-stale'),
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

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:      ()          => api.get('/notifications'),
  read:      (id: string) => api.patch(`/notifications/${id}/read`),
  readAll:   ()          => api.patch('/notifications/read-all'),
  archive:   (id: string) => api.patch(`/notifications/${id}/archive`),
  subscribe: (sub: any)  => api.post('/notifications/push/subscribe', sub),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  global: (q: string) => api.get('/search', { params: { q } }),
};

// ── Assets ────────────────────────────────────────────────────────────────────
export const assetsApi = {
  getNetWorth: () => api.get('/net-worth'),
  
  getAssets: () => api.get('/assets'),
  createAsset: (data: any) => api.post('/assets', data),
  updateAsset: (id: string, data: any) => api.patch(`/assets/${id}`, data),
  deleteAsset: (id: string) => api.delete(`/assets/${id}`),

  getLiabilities: () => api.get('/liabilities'),
  createLiability: (data: any) => api.post('/liabilities', data),
  updateLiability: (id: string, data: any) => api.patch(`/liabilities/${id}`, data),
  deleteLiability: (id: string) => api.delete(`/liabilities/${id}`),

  getIncomeSources: () => api.get('/income-sources'),
  createIncomeSource: (data: any) => api.post('/income-sources', data),
  updateIncomeSource: (id: string, data: any) => api.patch(`/income-sources/${id}`, data),
  deleteIncomeSource: (id: string) => api.delete(`/income-sources/${id}`),
};

// ── Goals ─────────────────────────────────────────────────────────────────────
export const goalsApi = {
  list: () => api.get('/goals'),
  get: (id: string) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.patch(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  invite: (id: string, inviteeId: string) => api.post(`/goals/${id}/invite`, { inviteeId }),
  contribute: (id: string, data: any) => api.post(`/goals/${id}/contribute`, data),
  progress: (id: string) => api.get(`/goals/${id}/progress`),
};

