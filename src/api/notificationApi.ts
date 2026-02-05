import axiosClient from './axiosClient';
import { Notification, NotificationRequest, NotificationResponse } from '@/types/notification.type';
import { ApiResult } from '@/types/page';

const notificationApi = {
  /**
   * Lấy danh sách thông báo của user
   */
  getNotifications: (pageNumber: number = 1, pageSize: number = 20) =>
    axiosClient.get<ApiResult<NotificationResponse>>('/notification', {
      params: { pageNumber, pageSize },
    }),

  /**
   * Lấy danh sách thông báo chưa đọc
   */
  getUnreadNotifications: () =>
    axiosClient.get<ApiResult<Notification[]>>('/notification/unread'),

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: () =>
    axiosClient.get<ApiResult<number>>('/notification/unread-count'),

  /**
   * Lấy chi tiết một thông báo
   */
  getNotificationById: (notificationId: string) =>
    axiosClient.get<ApiResult<Notification>>(`/notification/${notificationId}`),

  /**
   * Tạo thông báo (Admin only)
   */
  createNotification: (request: NotificationRequest) =>
    axiosClient.post<ApiResult<Notification>>('/notification', request),

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  markAsRead: (notificationId: string) =>
    axiosClient.put<ApiResult<Notification>>(`/notification/${notificationId}/read`),

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: () =>
    axiosClient.put<ApiResult<number>>('/notification/mark-all-read'),

  /**
   * Xóa thông báo
   */
  deleteNotification: (notificationId: string) =>
    axiosClient.delete<ApiResult<boolean>>(`/notification/${notificationId}`),
};

export default notificationApi;
