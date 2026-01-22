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
  label: string;           // Tên địa chỉ (Nhà, Công ty, ...)
  receiverName: string;    // Tên người nhận
  phoneNumber: string;     // Số điện thoại
  fullAddress: string;     // Địa chỉ chi tiết
  latitude?: number;       // Vĩ độ
  longitude?: number;      // Kinh độ
  isDefault: boolean;      // Địa chỉ mặc định
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
      const response = await axiosClient.get<ApiResult<Address[]>>('/address');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi lấy danh sách địa chỉ');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  addAddress: async (data: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }): Promise<Address> => {
    try {
      const response = await axiosClient.post<ApiResult<Address>>('/address', data);
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
      const response = await axiosClient.put<ApiResult<Address>>(`/address/${id}`, data);
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
      const response = await axiosClient.delete<ApiResult>(`/address/${id}`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi xóa địa chỉ');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    try {
      const response = await axiosClient.patch<ApiResult>(`/address/${id}/default`);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lỗi đặt địa chỉ mặc định');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    }
  },
};

export default userApi;
