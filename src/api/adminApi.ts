import axiosClient from './axiosClient';
import { User } from '@/types/user.type';
import { Product } from '@/types/product.type';
import { Category } from '@/types/product.type';
import { Order } from '@/types/order.type';

export interface UserFilter {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductFilter {
  search?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export interface OrderFilter {
  status?: string;
  customerId?: number;
  page?: number;
  pageSize?: number;
}

export interface ShipperStats {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalDeliveries: number;
  completedDeliveries: number;
  averageRating: number;
  successRate: number;
}

export const adminApi = {
  // Users Management
  users: {
    getAll: async (filters?: UserFilter) => {
      const response = await axiosClient.get('/admin/users', { params: filters });
      return response.data;
    },

    getById: async (userId: number) => {
      const response = await axiosClient.get(`/admin/users/${userId}`);
      return response.data;
    },

    update: async (userId: number, data: Partial<User>) => {
      const response = await axiosClient.put(`/admin/users/${userId}`, data);
      return response.data;
    },

    delete: async (userId: number) => {
      const response = await axiosClient.delete(`/admin/users/${userId}`);
      return response.data;
    },

    changeRole: async (userId: number, role: string) => {
      const response = await axiosClient.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    },

    toggleStatus: async (userId: number, isActive: boolean) => {
      const response = await axiosClient.put(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    },
  },

  // Products Management
  products: {
    getAll: async (filters?: ProductFilter) => {
      const response = await axiosClient.get('/admin/products', { params: filters });
      return response.data;
    },

    getById: async (productId: number) => {
      const response = await axiosClient.get(`/admin/products/${productId}`);
      return response.data;
    },

    create: async (data: Partial<Product>) => {
      const response = await axiosClient.post('/admin/products', data);
      return response.data;
    },

    update: async (productId: number, data: Partial<Product>) => {
      const response = await axiosClient.put(`/admin/products/${productId}`, data);
      return response.data;
    },

    delete: async (productId: number) => {
      const response = await axiosClient.delete(`/admin/products/${productId}`);
      return response.data;
    },

    bulkDelete: async (productIds: number[]) => {
      const response = await axiosClient.post('/admin/products/bulk-delete', { ids: productIds });
      return response.data;
    },
  },

  // Categories Management
  categories: {
    getAll: async () => {
      const response = await axiosClient.get('/admin/categories');
      return response.data;
    },

    getById: async (categoryId: number) => {
      const response = await axiosClient.get(`/admin/categories/${categoryId}`);
      return response.data;
    },

    create: async (data: Partial<Category>) => {
      const response = await axiosClient.post('/admin/categories', data);
      return response.data;
    },

    update: async (categoryId: number, data: Partial<Category>) => {
      const response = await axiosClient.put(`/admin/categories/${categoryId}`, data);
      return response.data;
    },

    delete: async (categoryId: number) => {
      const response = await axiosClient.delete(`/admin/categories/${categoryId}`);
      return response.data;
    },
  },

  // Orders Management
  orders: {
    getAll: async (filters?: OrderFilter) => {
      const response = await axiosClient.get('/admin/orders', { params: filters });
      return response.data;
    },

    getById: async (orderId: number) => {
      const response = await axiosClient.get(`/admin/orders/${orderId}`);
      return response.data;
    },

    updateStatus: async (orderId: number, status: string) => {
      const response = await axiosClient.put(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    },

    cancelOrder: async (orderId: number, reason?: string) => {
      const response = await axiosClient.post(`/admin/orders/${orderId}/cancel`, { reason });
      return response.data;
    },

    assignShipper: async (orderId: number, shipperId: number) => {
      const response = await axiosClient.put(`/admin/orders/${orderId}/assign-shipper`, { shipperId });
      return response.data;
    },

    reassignShipper: async (orderId: number, shipperId: number) => {
      const response = await axiosClient.put(`/admin/orders/${orderId}/reassign-shipper`, { shipperId });
      return response.data;
    },
  },

  // Shippers Management
  shippers: {
    getAll: async () => {
      const response = await axiosClient.get('/admin/shippers');
      // Return both array and stats if available
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || response.data;
    },

    getById: async (shipperId: number) => {
      const response = await axiosClient.get(`/admin/shippers/${shipperId}`);
      return response.data;
    },

    getStats: async (shipperId: number) => {
      const response = await axiosClient.get(`/admin/shippers/${shipperId}/stats`);
      return response.data;
    },

    toggleStatus: async (shipperId: number, isActive: boolean) => {
      const response = await axiosClient.put(`/admin/shippers/${shipperId}/status`, { isActive });
      return response.data;
    },

    getAssignedOrders: async (shipperId: number) => {
      const response = await axiosClient.get(`/admin/shippers/${shipperId}/orders`);
      return response.data;
    },
  },

  // Analytics & Reports
  reports: {
    getDashboardStats: async () => {
      const response = await axiosClient.get('/admin/reports/dashboard');
      return response.data;
    },

    getSalesReport: async (startDate?: string, endDate?: string) => {
      const response = await axiosClient.get('/admin/reports/sales', {
        params: { startDate, endDate },
      });
      return response.data;
    },

    getRevenueReport: async (startDate?: string, endDate?: string) => {
      const response = await axiosClient.get('/admin/reports/revenue', {
        params: { startDate, endDate },
      });
      return response.data;
    },

    getTopProducts: async (limit = 10) => {
      const response = await axiosClient.get('/admin/reports/top-products', {
        params: { limit },
      });
      return response.data;
    },

    getTopCategories: async (limit = 10) => {
      const response = await axiosClient.get('/admin/reports/top-categories', {
        params: { limit },
      });
      return response.data;
    },

    getUserMetrics: async () => {
      const response = await axiosClient.get('/admin/reports/user-metrics');
      return response.data;
    },
  },
};
