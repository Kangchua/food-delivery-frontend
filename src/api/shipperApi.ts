import axiosClient from './axiosClient';
import { Order, OrderStatus } from '@/types/order.type';

export interface DeliveryFilter {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export const shipperApi = {
  // Get assigned orders for current shipper
  getAssignedOrders: async (filters?: DeliveryFilter) => {
    const response = await apiClient.get('/shipper/orders', { params: filters });
    return response.data;
  },

  // Get order details for delivery
  getOrderDetail: async (orderId: number) => {
    const response = await apiClient.get(`/shipper/orders/${orderId}`);
    return response.data;
  },

  // Accept a delivery order
  acceptOrder: async (orderId: number) => {
    const response = await apiClient.put(`/shipper/orders/${orderId}/accept`, {});
    return response.data;
  },

  // Start delivery (leave for delivery)
  startDelivery: async (orderId: number) => {
    const response = await apiClient.put(`/shipper/orders/${orderId}/start-delivery`, {});
    return response.data;
  },

  // Confirm delivery (mark as delivered)
  confirmDelivery: async (orderId: number, notes?: string) => {
    const response = await apiClient.put(`/shipper/orders/${orderId}/confirm-delivery`, {
      notes,
    });
    return response.data;
  },

  // Take photo of delivery (optional)
  uploadDeliveryPhoto: async (orderId: number, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await apiClient.post(
      `/shipper/orders/${orderId}/upload-delivery-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get delivery history (completed orders)
  getDeliveryHistory: async (filters?: DeliveryFilter) => {
    const response = await apiClient.get('/shipper/history', { params: filters });
    return response.data;
  },

  // Get shipper dashboard/stats
  getDashboard: async () => {
    const response = await apiClient.get('/shipper/dashboard');
    return response.data;
  },

  // Get shipper profile
  getProfile: async () => {
    const response = await apiClient.get('/shipper/profile');
    return response.data;
  },

  // Update shipper profile
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/shipper/profile', data);
    return response.data;
  },

  // Report delivery issue
  reportIssue: async (orderId: number, issue: string) => {
    const response = await apiClient.post(`/shipper/orders/${orderId}/report-issue`, { issue });
    return response.data;
  },
};
