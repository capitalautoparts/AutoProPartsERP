import axios from 'axios';
import { Product, Customer, Order, ImportResult } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Product>('/products', product),
  update: (id: string, product: Partial<Product>) => 
    api.put<Product>(`/products/${id}`, product),
  delete: (id: string) => api.delete(`/products/${id}`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImportResult>('/products/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  importXML: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImportResult>('/products/import/xml', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportExcel: () => api.get('/products/export/excel', { responseType: 'blob' }),
  exportXML: () => api.get('/products/export/xml', { responseType: 'blob' }),
};

// Customers API
export const customersApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (customer: Omit<Customer, 'id'>) => api.post<Customer>('/customers', customer),
  update: (id: string, customer: Partial<Customer>) => 
    api.put<Customer>(`/customers/${id}`, customer),
  delete: (id: string) => api.delete(`/customers/${id}`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImportResult>('/customers/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportExcel: () => api.get('/customers/export/excel', { responseType: 'blob' }),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (order: Omit<Order, 'id'>) => api.post<Order>('/orders', order),
  update: (id: string, order: Partial<Order>) => 
    api.put<Order>(`/orders/${id}`, order),
  delete: (id: string) => api.delete(`/orders/${id}`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImportResult>('/orders/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportExcel: () => api.get('/orders/export/excel', { responseType: 'blob' }),
};

export default api;