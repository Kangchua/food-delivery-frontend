import axiosClient from './axiosClient';

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
}

export interface AccountResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateAccountRequest {
  fullName?: string;
  phoneNumber?: string;
  avatar?: File;
}

export const accountApi = {
  getAccount: () => axiosClient.get<ApiResponse<AccountResponse>>('/Account'),

  updateAccount: (data: UpdateAccountRequest) => {
    const formData = new FormData();
    if (data.fullName) formData.append('FullName', data.fullName);
    if (data.phoneNumber) formData.append('Phone', data.phoneNumber);
    if (data.avatar) formData.append('Avatar', data.avatar);

    return axiosClient.put<ApiResponse<AccountResponse>>('/Account', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  changePassword: (data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) =>
    axiosClient.post<ApiResponse>('/auth/change-password', data),
};