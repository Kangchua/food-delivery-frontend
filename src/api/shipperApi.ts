import axiosClient from './axiosClient';
import { OrderAdminSummaryResponse, OrderDetailResponse } from '@/types/order.type';


interface DashboardStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  deliveryInProgress: number;
  earningToday: number;
  averageRating: number;
}

export const shipperApi = {
  getDashboard: () => 
  axiosClient.get<DashboardStats>(`/Shipper/dashboard-stats`),

  
  getAssignedOrders: () => 
    axiosClient.get<OrderAdminSummaryResponse[]>(`/Shipper/assigned-orders`),

  // Lấy danh sách các đơn hàng sẵn sàng để shipper tự nhận
  getAvailableOrders: () =>
    axiosClient.get<OrderAdminSummaryResponse[]>(`/Shipper/available-orders`),

  // Shipper chấp nhận/nhận một đơn hàng
  acceptOrder: (orderId: string) =>
    axiosClient.post(`/Shipper/accept-order/${orderId}`),

  // 3. Xác nhận lấy hàng
  confirmPickup: (orderId: string) => 
    axiosClient.post(`/Shipper/confirm-pickup/${orderId}`),

  // 4. Giao hàng thành công
  deliverySuccess: (orderId: string) => 
    axiosClient.post(`/Shipper/delivery-success/${orderId}`),

  // 5. Giao hàng thất bại
  deliveryFailed: (orderId: string, reason: string) => 
    axiosClient.post(`/Shipper/delivery-failed`, { orderId, reason }),

  // 6. Lấy chi tiết một đơn hàng (Dùng cho trang Detail)
  getOrderById: (orderId: string) =>
    axiosClient.get<OrderDetailResponse>(`/Shipper/order/${orderId}`),

  // 7. Lấy lịch sử theo UserId
  getHistory: (userId: string) => 
    axiosClient.get<OrderAdminSummaryResponse[]>(`/Shipper/history/${userId}`),
};