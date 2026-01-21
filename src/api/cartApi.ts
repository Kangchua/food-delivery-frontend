import axiosClient from './axiosClient';

export interface CartItem {
  productId: string;
  quantity: number;
  price?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const cartApi = {
  // Lấy giỏ hàng
  get: async (): Promise<Cart> => {
    try {
      const response = await axiosClient.get<ApiResult<Cart>>('/cart');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy giỏ hàng');
      }
      return response.data.data || { items: [], total: 0 };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Thêm sản phẩm vào giỏ
  addItem: async (productId: string, quantity: number): Promise<Cart> => {
    try {
      const response = await axiosClient.post<ApiResult<Cart>>('/cart/items', {
        productId,
        quantity,
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi thêm sản phẩm vào giỏ');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Cập nhật số lượng sản phẩm
  updateItem: async (productId: string, quantity: number): Promise<Cart> => {
    try {
      const response = await axiosClient.put<ApiResult<Cart>>('/cart/items', {
        productId,
        quantity,
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi cập nhật giỏ hàng');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Xóa sản phẩm khỏi giỏ
  removeItem: async (productId: string): Promise<Cart> => {
    try {
      const response = await axiosClient.delete<ApiResult<Cart>>(`/cart/items/${productId}`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi xóa sản phẩm khỏi giỏ');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Xóa tất cả sản phẩm trong giỏ
  clear: async (): Promise<void> => {
    try {
      const response = await axiosClient.post<ApiResult>('/cart/clear');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi xóa giỏ hàng');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },
};

export default cartApi;
