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
  get: async (): Promise<any> => {
    try {
      const response = await axiosClient.get<any>('/cart');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy giỏ hàng');
      }
      // Backend returns PagedResponse<CartItemDto>
      // response.data.data.data contains the items array
      const cartData = response.data.data;
      if (cartData && cartData.data) {
        return {
          items: cartData.data,
          total: 0,
        };
      }
      return { items: [], total: 0 };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Thêm sản phẩm vào giỏ
  addItem: async (productId: string, quantity: number): Promise<Cart> => {
    try {
      const response = await axiosClient.post<ApiResult<Cart>>('/cart', {
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
      const response = await axiosClient.patch<ApiResult<Cart>>(`/cart/item/${productId}`, {
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
      const response = await axiosClient.delete<ApiResult<Cart>>(`/cart/item/${productId}`);
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

  // Lưu toàn bộ giỏ hàng lên server
  saveCart: async (items: CartItem[]): Promise<void> => {
    try {
      const response = await axiosClient.post<ApiResult>('/cart/save', {
        items,
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lưu giỏ hàng');
      }
    } catch (error: any) {
      console.error('Error saving cart:', error);
      // Không throw để không block logout
    }
  },
};

export default cartApi;
