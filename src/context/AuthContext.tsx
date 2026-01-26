import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types/enum';
import authApi from '@/api/authApi';
import cartApi from '@/api/cartApi';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: 'customer' | 'shipper' | 'admin';
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'auth_user';

// Helper function to convert roles array to primary role
const getMainRole = (roles?: string[]): UserRole => {
  if (!roles || roles.length === 0) return UserRole.CUSTOMER;
  
  // Get first role and normalize it
  const roleStr = String(roles[0]).toLowerCase().trim();
  
  // Match against UserRole enum values
  if (roleStr === UserRole.ADMIN || roleStr === 'admin') return UserRole.ADMIN;
  if (roleStr === UserRole.SHIPPER || roleStr === 'shipper') return UserRole.SHIPPER;
  if (roleStr === UserRole.CUSTOMER || roleStr === 'customer') return UserRole.CUSTOMER;
  
  // Default fallback
  return UserRole.CUSTOMER;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Login to get tokens
      await authApi.login({ email, password });

      // Get user info from backend using the new access token
      const userInfo = await authApi.getUserInfo();

      // Convert roles to main role
      const mainRole = getMainRole(userInfo.roles);
      console.log('DEBUG - Login:', { roles: userInfo.roles, mainRole });

      const user: User = {
        id: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.fullName,
        phone: userInfo.phone,
        role: mainRole,
        avatar: userInfo.avatar,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: 'customer' | 'shipper' | 'admin';
  }): Promise<void> => {
    setIsLoading(true);
    try {
      // Register and get tokens
      await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: (data.role === 'customer' || data.role === 'shipper') 
          ? (data.role as 'customer' | 'shipper') 
          : 'customer',
      });

      // Get user info from backend
      const userInfo = await authApi.getUserInfo();
      const mainRole = getMainRole(userInfo.roles);

      const user: User = {
        id: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.fullName,
        phone: userInfo.phone,
        role: mainRole,
        avatar: userInfo.avatar,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setUser(user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Save cart to database before logout
      const cartData = localStorage.getItem('cart');
      
      if (cartData) {
        try {
          const items = JSON.parse(cartData);
          
          // Convert CartItem (with product object) to request format (with productId)
          const cartItems = items.map((item: any) => ({
            productId: item.product?.id || item.productId,
            quantity: item.quantity,
          }));
          
          await cartApi.saveCart(cartItems);
        } catch (error) {
          console.error('Error saving cart:', error);
          // Continue with logout even if cart save fails
        }
      }

      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth tokens
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
