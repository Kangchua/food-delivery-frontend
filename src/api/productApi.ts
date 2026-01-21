import axiosClient from './axiosClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  available: boolean;
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await axiosClient.get<ApiResult<Product[]>>('/products');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy danh sách sản phẩm');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const response = await axiosClient.get<ApiResult<Product>>(`/products/${id}`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy chi tiết sản phẩm');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  search: async (query: string): Promise<Product[]> => {
    try {
      const response = await axiosClient.get<ApiResult<Product[]>>('/products/search', {
        params: { q: query },
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi tìm kiếm sản phẩm');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      const response = await axiosClient.get<ApiResult<Product[]>>(
        `/products?categoryId=${categoryId}`
      );
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy sản phẩm theo danh mục');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },
};

export default productApi;
