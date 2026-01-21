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
  createdAt?: string;
  displayOrder?: number;
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

// Helper function to map backend product response to frontend Product
const mapProductResponse = (data: any): Product => {
  return {
    id: data.id || data.Id,
    name: data.name || data.Name,
    description: data.description || data.Description || '',
    price: data.price || data.Price,
    // Map ImageUrl from backend to image for frontend
    image: data.imageUrl || data.ImageUrl || data.image || data.Image || '',
    categoryId: data.categoryId || data.CategoryId,
    categoryName: data.categoryName || data.CategoryName || '',
    rating: data.rating || data.Rating || 0,
    soldCount: data.soldCount || data.SoldCount || 0,
    isAvailable: data.isAvailable !== undefined ? data.isAvailable : data.IsAvailable !== undefined ? data.IsAvailable : true,
    createdAt: data.createdAt || data.CreatedAt,
    displayOrder: data.displayOrder !== undefined ? data.displayOrder : data.DisplayOrder !== undefined ? data.DisplayOrder : 0,
  };
};

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
      let products: any[] = [];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else {
        // Handle wrapped ApiResult format
        const wrappedData = response.data as ApiResult<any>;
        if (!wrappedData.isSuccess) {
          throw new Error(wrappedData.message || 'Lấy sản phẩm thất bại');
        }
        products = wrappedData.data || [];
      }
      
      // Map each product from backend format to frontend format
      return products.map(mapProductResponse);
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
      let product: any;
      if ('price' in response.data) {
        product = response.data;
      } else {
        // Handle wrapped ApiResult format
        const wrappedData = response.data as ApiResult<any>;
        if (!wrappedData.isSuccess) {
          throw new Error(wrappedData.message || 'Lấy chi tiết sản phẩm thất bại');
        }
        product = wrappedData.data;
      }
      
      if (!product) return null;
      
      // Map product from backend format to frontend format
      return mapProductResponse(product);
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
      let products: any[] = [];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else {
        // Handle wrapped ApiResult format
        const wrappedData = response.data as ApiResult<any>;
        if (!wrappedData.isSuccess) {
          throw new Error(wrappedData.message || 'Tìm kiếm sản phẩm thất bại');
        }
        products = wrappedData.data || [];
      }
      
      // Map each product from backend format to frontend format
      return products.map(mapProductResponse);
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
