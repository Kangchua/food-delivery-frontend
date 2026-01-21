import axiosClient from './axiosClient';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'outForDelivery'
  | 'delivered'
  | 'cancelled';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'momo' | 'vnpay' | 'bank';
  deliveryAddress: string;
  note?: string;
  shipperId?: string;
  shipperName?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusHistoryItem[];
}

export interface CreateOrderRequest {
  deliveryAddress: string;
  note?: string;
  paymentMethod: 'cod' | 'momo' | 'vnpay' | 'bank';
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const orderApi = {
  // Tạo đơn hàng
  create: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      const response = await axiosClient.post<Order | ApiResult<Order>>('/orders', data);
      
      // Handle both plain object and wrapped response
      if ('id' in response.data && 'orderNumber' in response.data) {
        return response.data as Order;
      }
      
      const wrappedData = response.data as ApiResult<Order>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lỗi tạo đơn hàng');
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Lấy danh sách đơn hàng
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await axiosClient.get<Order[] | ApiResult<Order[]>>('/orders');
      
      // Handle both plain array and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      const wrappedData = response.data as ApiResult<Order[]>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lỗi lấy danh sách đơn hàng');
      }
      return wrappedData.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Lấy chi tiết đơn hàng
  getById: async (id: string): Promise<Order> => {
    try {
      const response = await axiosClient.get<Order | ApiResult<Order>>(`/orders/${id}`);
      
      // Handle both plain object and wrapped response
      if ('id' in response.data && 'orderNumber' in response.data) {
        return response.data as Order;
      }
      
      const wrappedData = response.data as ApiResult<Order>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lỗi lấy chi tiết đơn hàng');
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Hủy đơn hàng
  cancel: async (id: string): Promise<Order> => {
    try {
      const response = await axiosClient.post<Order | ApiResult<Order>>(`/orders/${id}/cancel`);
      
      // Handle both plain object and wrapped response
      if ('id' in response.data && 'orderNumber' in response.data) {
        return response.data as Order;
      }
      
      const wrappedData = response.data as ApiResult<Order>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lỗi hủy đơn hàng');
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Xác nhận giao hàng (shipper)
  confirmDelivery: async (id: string): Promise<Order> => {
    try {
      const response = await axiosClient.post<Order | ApiResult<Order>>(`/orders/${id}/confirm-delivery`);
      
      // Handle both plain object and wrapped response
      if ('id' in response.data && 'orderNumber' in response.data) {
        return response.data as Order;
      }
      
      const wrappedData = response.data as ApiResult<Order>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lỗi xác nhận giao hàng');
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },
};

export default orderApi;
