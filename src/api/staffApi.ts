import axiosClient from './axiosClient';

export interface StaffOrder {
  id: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: number;
  items: string[];
  createdAt: string;
}

export interface StaffStats {
  totalOrders: number;
  preparingOrders: number;
  readyOrders: number;
  issueOrders: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'in_stock' | 'low' | 'out_of_stock';
}

const staffApi = {
  // Dashboard stats
  getStats: async (): Promise<any> => {
    const response = await axiosClient.get('/staff/stats');
    return response.data;
  },

  // Get orders for preparation
  getOrdersForPreparation: async () => {
    const response = await axiosClient.get('/staff/orders');
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: number) => {
    const response = await axiosClient.put(`/staff/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  },

  // Get inventory
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await axiosClient.get('/staff/inventory');
    return response.data;
  },

  // Update inventory quantity
  updateInventoryQuantity: async (itemId: string, quantity: number) => {
    const response = await axiosClient.put(
      `/staff/inventory/${itemId}`,
      { quantity }
    );
    return response.data;
  },

  // Report issue
  reportIssue: async (orderId: string, issue: string) => {
    const response = await axiosClient.post(`/staff/orders/${orderId}/report`, {
      issue,
    });
    return response.data;
  },

  // Confirm order (Pending -> Confirmed)
  confirmOrder: async (orderId: string) => {
    const response = await axiosClient.post(`/staff/orders/${orderId}/confirm`);
    return response.data;
  },

  // Start preparing order (Confirmed -> Preparing)
  startPreparingOrder: async (orderId: string) => {
    const response = await axiosClient.post(`/staff/orders/${orderId}/start-preparing`);
    return response.data;
  },

  // Mark order ready (Preparing -> ReadyForPickup)
  markOrderReady: async (orderId: string) => {
    const response = await axiosClient.post(`/staff/orders/${orderId}/mark-ready`);
    return response.data;
  },

  // Report order issue with description and type
  reportOrderIssue: async (orderId: string, issueDescription: string, issueType: string) => {
    const response = await axiosClient.post(`/staff/orders/${orderId}/report-issue`, {
      issueDescription,
      issueType,
    });
    return response.data;
  },

  // Get staff profile
  getProfile: async () => {
    const response = await axiosClient.get('/staff/profile');
    return response.data;
  },

  // Update staff profile
  updateProfile: async (data: any) => {
    const response = await axiosClient.put('/staff/profile', data);
    return response.data;
  },

  // Initialize staff profile for current user
  initializeStaff: async () => {
    const response = await axiosClient.post('/staff/initialize');
    return response.data;
  },
};

export default staffApi;
