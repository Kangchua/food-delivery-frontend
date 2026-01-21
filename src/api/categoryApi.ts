import axiosClient from './axiosClient';

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  productCount?: number;
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const categoryApi = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await axiosClient.get<ApiResult<Category[]>>('/categories');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy danh sách danh mục');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  // Lấy chi tiết danh mục theo ID
  getById: async (id: string): Promise<Category> => {
    try {
      const response = await axiosClient.get<ApiResult<Category>>(`/categories/${id}`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy chi tiết danh mục');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },
};

export default categoryApi;
