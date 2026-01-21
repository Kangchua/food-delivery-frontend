import axiosClient from './axiosClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await axiosClient.get<ApiResult<UserProfile>>('/account/profile');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy thông tin người dùng');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await axiosClient.put<ApiResult<UserProfile>>('/account/profile', data);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi cập nhật thông tin');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  getAddresses: async (): Promise<Address[]> => {
    try {
      const response = await axiosClient.get<ApiResult<Address[]>>('/addresses');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy danh sách địa chỉ');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  addAddress: async (data: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    try {
      const response = await axiosClient.post<ApiResult<Address>>('/addresses', data);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi thêm địa chỉ');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  updateAddress: async (id: string, data: Partial<Address>): Promise<Address> => {
    try {
      const response = await axiosClient.put<ApiResult<Address>>(`/addresses/${id}`, data);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi cập nhật địa chỉ');
      }
      return response.data.data!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  deleteAddress: async (id: string): Promise<void> => {
    try {
      const response = await axiosClient.delete<ApiResult>(`/addresses/${id}`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi xóa địa chỉ');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },
};

export default userApi;
