import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ==== AUTH ====
export const loginAPI = (data) => API.post('/auth/login', data);

// ==== ADMIN ROUTES ====
export const getDashboardSummary = () => API.get('/admin/dashboard/summary');
export const getActiveAlerts = () => API.get('/admin/alerts');


export const getProducts = () => API.get('/admin/products');
export const createProduct = (data) => API.post('/admin/products', data);
export const updateProduct = (id, data) => API.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/products/${id}`);

export const getVariants = () => API.get('/admin/variants');
export const getVariantsByProduct = (productId) => API.get(`/admin/variants/product/${productId}`);
export const createVariant = (data) => API.post('/admin/variants', data);
export const updateStock = (id, stock) => API.put(`/admin/variants/${id}/stock`, { stock });
export const updateVariant = (id, data) => API.put(`/admin/variants/${id}`, data);
export const deleteVariant = (id) => API.delete(`/admin/variants/${id}`);
export const getLowStockVariants = () => API.get('/admin/variants/low-stock');
export const getOutOfStockVariants = () => API.get('/admin/variants/out-of-stock');

export const getSuppliers = () => API.get('/admin/suppliers');
export const createSupplier = (data) => API.post('/admin/suppliers', data);
export const updateSupplier = (id, data) => API.put(`/admin/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/admin/suppliers/${id}`);

export const getWorkers = () => API.get('/admin/workers');
export const createWorker = (data) => API.post('/admin/workers', data);
export const updateWorker = (id, data) => API.put(`/admin/workers/${id}`, data);
export const deleteWorker = (id) => API.delete(`/admin/workers/${id}`);

export const getTasks = () => API.get('/admin/tasks');
export const getTasksByStatus = (status) => API.get(`/admin/tasks/status/${status}`);
export const getOverdueTasks = () => API.get('/admin/tasks/overdue');
export const createTask = (data) => API.post('/admin/tasks', data);
export const updateTaskStatusAdmin = (id, status) => API.put(`/admin/tasks/${id}/status`, { status });
export const deleteTask = (id) => API.delete(`/admin/tasks/${id}`);

export const getNotifications = () => API.get('/admin/notifications');
export const getNotificationsByType = (type) => API.get(`/admin/notifications/type/${type}`);
export const getNotificationsByPriority = (priority) => API.get(`/admin/notifications/priority/${priority}`);
export const markNotificationReadAdmin = (id) => API.put(`/admin/notifications/${id}/read`);
export const dismissNotificationAdmin = (id) => API.put(`/admin/notifications/${id}/dismiss`);
export const markAllNotificationsReadAdmin = () => API.put('/admin/notifications/read-all');
export const deleteAllNotificationsAdmin = () => API.delete('/admin/notifications/delete-all');


// ==== LABOUR ROUTES ====
export const getMyTasks = () => API.get('/labour/tasks');
export const updateMyTaskStatus = (id, status) => API.put(`/labour/tasks/${id}/status`, { status });

export const getMyNotifications = () => API.get('/labour/notifications');
export const markMyNotificationRead = (id) => API.put(`/labour/notifications/${id}/read`);
export const dismissMyNotification = (id) => API.put(`/labour/notifications/${id}/dismiss`);
export const markAllMyNotificationsRead = () => API.put('/labour/notifications/read-all');
export const deleteAllMyNotifications = () => API.delete('/labour/notifications/delete-all');

// ==== LABOUR PRODUCT ROUTES ====
export const getLabourProducts = () => API.get('/labour/products');
export const getLabourVariants = () => API.get('/labour/products/variants');
export const updateLabourStock = (id, stock) => API.put(`/labour/products/variants/${id}/stock`, { stock });

export default API;
