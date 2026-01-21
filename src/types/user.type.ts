import { UserRole } from './enum';

// Address
export interface Address {
  id: string;
  label: string;           // Tên địa chỉ (Nhà, Công ty, ...)
  recipientName: string;   // Tên người nhận
  phone: string;           // Số điện thoại
  address: string;         // Địa chỉ chi tiết
  ward?: string;           // Phường/Xã
  district?: string;       // Quận/Huyện
  city?: string;           // Thành phố
  isDefault: boolean;      // Địa chỉ mặc định
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  addresses?: Address[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Request/Response
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Profile Update
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

// Address CRUD
export interface CreateAddressRequest {
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}
