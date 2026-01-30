import axiosClient from './axiosClient';

export interface AdminUserListDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  totalOrders: number;
  totalSpent: number;
  roles: string[];
}

export interface AdminUserDetailDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  roles: string[];
  totalOrders: number;
  totalSpent: number;
  recentOrders: UserOrderSummary[];
}

export interface UserOrderSummary {
  orderId: string;
  orderCode: string;
  amount: number;
  status: number;
  createdAt: string;
}

export interface UserFilterModel {
  searchQuery?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const UsersApi = {
  getAllUsers: async (filter: UserFilterModel) => {
    try {
      const response = await axiosClient.get<any>('/admin/users', {
        params: {
          searchQuery: filter.searchQuery,
          isActive: filter.isActive,
          page: filter.page || 1,
          pageSize: filter.pageSize || 10,
        },
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Lỗi kết nối hệ thống';
      throw new Error(msg);
    }
  },

  getUserDetail: async (userId: string): Promise<AdminUserDetailDto> => {
    try {
      const response = await axiosClient.get<any>(`/admin/users/${userId}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Lỗi kết nối hệ thống';
      throw new Error(msg);
    }
  },

  blockUser: async (userId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.patch<any>(`/admin/users/${userId}/block`);
      return response.data?.isSuccess || false;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Lỗi kết nối hệ thống';
      throw new Error(msg);
    }
  },

  unblockUser: async (userId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.patch<any>(`/admin/users/${userId}/unblock`);
      return response.data?.isSuccess || false;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Lỗi kết nối hệ thống';
      throw new Error(msg);
    }
  },
};
