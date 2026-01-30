// Export all API clients and types
export * from './authApi';
export { userApi } from './userApi';
export { productApi } from './productApi';
export { categoryApi } from './categoryApi';
export { cartApi } from './cartApi';
export { orderApi } from './orderApi';
export { paymentApi } from './paymentApi';
export { shipperApi } from './shipperApi';
export { adminApi } from './adminApi';
export { default as notificationApi } from './notificationApi';

// Re-export types from authApi to avoid conflicts
export type { UserInfo, AccountResponse, LoginResponse, LoginRequest, RegisterRequest } from './authApi';
