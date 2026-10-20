import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  deactivate: (id) => api.delete(`/products/${id}`),
};

// ─── Warehouses ───────────────────────────────────────────────────────────────
export const warehouseAPI = {
  getAll: () => api.get('/warehouses'),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

// ─── Bins ─────────────────────────────────────────────────────────────────────
export const binAPI = {
  getAll: (params) => api.get('/bins', { params }),
  getById: (id) => api.get(`/bins/${id}`),
  create: (data) => api.post('/bins', data),
  update: (id, data) => api.put(`/bins/${id}`, data),
  delete: (id) => api.delete(`/bins/${id}`),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  getStats: () => api.get('/inventory/stats'),
};

// ─── Receipts ─────────────────────────────────────────────────────────────────
export const receiptAPI = {
  getAll: () => api.get('/receipts'),
  getById: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  startPicking: (id) => api.put(`/orders/${id}/start-picking`),
  confirmPick: (id, data) => api.put(`/orders/${id}/confirm-pick`, data),
  dispatch: (id) => api.put(`/orders/${id}/dispatch`),
  getInventoryAvailability: (id) => api.get(`/orders/${id}/inventory-availability`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params }),
};
