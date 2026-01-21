import axiosClient from './axiosClient';

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  categoryName: string;
  rating: number;
  soldCount: number;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  note?: string;
  shipperId?: string;
  shipperName?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryItem[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'outForDelivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'momo' | 'vnpay' | 'bank';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const productApi = {
  // Lấy tất cả danh mục
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await axiosClient.get<Category[] | ApiResult<Category[]>>('/categories');
      
      // Handle both plain array and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle wrapped ApiResult format
      const wrappedData = response.data as ApiResult<Category[]>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lấy danh mục thất bại');
      }
      return wrappedData.data || [];
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Lấy tất cả sản phẩm hoặc lọc theo categoryId / search
  getProducts: async (categoryId?: string, search?: string): Promise<Product[]> => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (search) params.append('q', search);

      const query = params.toString();
      const url = `/products${query ? '?' + query : ''}`;

      const response = await axiosClient.get<Product[] | ApiResult<Product[]>>(url);
      
      // Handle both plain array and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle wrapped ApiResult format
      const wrappedData = response.data as ApiResult<Product[]>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lấy sản phẩm thất bại');
      }
      return wrappedData.data || [];
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await axiosClient.get<Product | ApiResult<Product>>(`/products/${id}`);
      
      // Handle both plain object and wrapped response
      if ('price' in response.data) {
        return response.data as Product;
      }
      
      // Handle wrapped ApiResult format
      const wrappedData = response.data as ApiResult<Product>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Lấy sản phẩm thất bại');
      }
      return wrappedData.data || null;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await axiosClient.get<Product[] | ApiResult<Product[]>>('/products/search', {
        params: { q: query }
      });
      
      // Handle both plain array and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle wrapped ApiResult format
      const wrappedData = response.data as ApiResult<Product[]>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || 'Tìm kiếm sản phẩm thất bại');
      }
      return wrappedData.data || [];
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },
};

export const orderApi = {
  // Tạo đơn hàng mới
  createOrder: async (orderData: {
    deliveryAddress: string;
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: PaymentMethod;
    note?: string;
  }): Promise<Order> => {
    try {
      const response = await axiosClient.post<ApiResult<Order>>('/orders', orderData);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Tạo đơn hàng thất bại');
      }
      return response.data.data!;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Lấy danh sách đơn hàng của người dùng
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await axiosClient.get<ApiResult<Order[]>>('/orders');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lấy danh sách đơn hàng thất bại');
      }
      return response.data.data || [];
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await axiosClient.get<ApiResult<Order>>(`/orders/${id}`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lấy chi tiết đơn hàng thất bại');
      }
      return response.data.data!;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (id: string, status: OrderStatus, note?: string): Promise<Order> => {
    try {
      const response = await axiosClient.put<ApiResult<Order>>(`/orders/${id}/status`, {
        status,
        note,
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
      }
      return response.data.data!;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (id: string): Promise<Order> => {
    try {
      const response = await axiosClient.post<ApiResult<Order>>(`/orders/${id}/cancel`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Hủy đơn hàng thất bại');
      }
      return response.data.data!;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },
};

export default { productApi, orderApi };
