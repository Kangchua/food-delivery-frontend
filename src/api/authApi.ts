import axiosClient from './axiosClient';

// Helper function to decode JWT token
const decodeToken = (token: string): Record<string, any> => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return {};
  }
};

// Helper function to extract roles from JWT token
const getRolesFromToken = (token: string): string[] => {
  const decoded = decodeToken(token);
  
  // JWT role claims can be in different formats
  // Try common formats: 'role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
  const roleKey = Object.keys(decoded).find(
    (key) => key === 'role' || key === 'roles' || key.includes('/role')
  );
  
  if (roleKey) {
    const value = decoded[roleKey];
    // Handle both single role (string) and multiple roles (array)
    return Array.isArray(value) ? value : [value];
  }
  
  return [];
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: 'customer' | 'shipper';
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
}

export interface AccountResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
  roles: string[];
  isActive: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: 'customer' | 'shipper' | 'admin';
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResult<T = Record<string, unknown>> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginResponse | ApiResult<LoginResponse>>('/auth/login', data);

      // Handle both plain response and wrapped response
      let tokens: LoginResponse;
      
      if ('accessToken' in response.data) {
        // Plain response
        tokens = response.data as LoginResponse;
      } else {
        // Wrapped ApiResult response
        const wrappedData = response.data as ApiResult<LoginResponse>;
        if (!wrappedData.isSuccess) {
          throw new Error(wrappedData.message || 'Đăng nhập thất bại');
        }
        tokens = wrappedData.data!;
      }

      // Save tokens to sessionStorage
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);

      return tokens;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  // Get user info from backend (requires token)
  getUserInfo: async (): Promise<AccountResponse> => {
    try {
      const response = await axiosClient.get<AccountResponse | ApiResult<AccountResponse>>('/account');
      
      // Handle both plain response and wrapped response
      let userInfo: AccountResponse;
      
      // Check if response has typical AccountResponse properties (id, email, fullName)
      if ('id' in response.data && 'email' in response.data && 'fullName' in response.data) {
        // Plain response - directly use as AccountResponse
        userInfo = response.data as AccountResponse;
      } else if ('data' in response.data && 'isSuccess' in response.data) {
        // Wrapped ApiResult response
        const wrappedData = response.data as ApiResult<AccountResponse>;
        if (!wrappedData.isSuccess) {
          throw new Error(wrappedData.message || 'Không thể lấy thông tin user');
        }
        userInfo = wrappedData.data!;
      } else {
        // Fallback: treat as plain response
        userInfo = response.data as AccountResponse;
      }

      // Extract roles from JWT token if not provided by backend
      if (!userInfo.roles || userInfo.roles.length === 0) {
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken) {
          userInfo.roles = getRolesFromToken(accessToken);
          console.log('DEBUG - Extracted roles from JWT token:', userInfo.roles);
        } else {
          userInfo.roles = [];
        }
      }

      console.log('DEBUG - getUserInfo returned:', userInfo);
      return userInfo;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
      // Step 1: Register user
      const registerResponse = await axiosClient.post<any>('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });

      // Check if registration was successful
      if (registerResponse.data.isSuccess === false) {
        throw new Error(registerResponse.data.message || 'Đăng ký thất bại');
      }

      // Step 2: Auto login after registration
      const loginResponse = await axiosClient.post<LoginResponse | ApiResult<LoginResponse>>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      // Handle both plain response and wrapped response
      let tokens: LoginResponse;
      
      if ('accessToken' in loginResponse.data) {
        // Plain response
        tokens = loginResponse.data as LoginResponse;
      } else {
        // Wrapped ApiResult response
        const wrappedData = loginResponse.data as ApiResult<LoginResponse>;
        if (!wrappedData.isSuccess) {
          throw new Error(wrappedData.message || 'Đăng nhập thất bại');
        }
        tokens = wrappedData.data!;
      }

      // Save tokens to sessionStorage
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);

      return tokens;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<ApiResult<LoginResponse>>(
        '/auth/refresh',
        { refreshToken }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Refresh token thất bại');
      }

      const tokens = response.data.data!;
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);

      return tokens;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Lỗi kết nối server';
      throw new Error(message);
    }
  },
};

export default authApi;
