import axiosClient from './axiosClient';

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

export const notificationApi = {
  getNotifications: (pageNumber = 1, pageSize = 20) =>
    axiosClient.get<{
      data: NotificationResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`/Notification?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  getUnreadNotifications: () =>
    axiosClient.get<NotificationResponse[]>(`/Notification/unread`),

  markAsRead: (notificationId: string) =>
    axiosClient.put(`/Notification/${notificationId}/read`),

  markAllAsRead: () =>
    axiosClient.put(`/Notification/mark-all-read`),
};