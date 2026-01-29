import { useState, useCallback, useEffect } from 'react';
import notificationApi from '@/api/notificationApi';
import { Notification } from '@/types/notification.type';

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy danh sách thông báo
   */
  const fetchNotifications = useCallback(async (pageNumber: number = 1, pageSize: number = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationApi.getNotifications(pageNumber, pageSize);
      if (response.data.isSuccess) {
        setNotifications(response.data.data?.notifications || []);
        setUnreadCount(response.data.data?.unreadCount || 0);
      } else {
        setError(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('An error occurred while fetching notifications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Lấy chỉ thông báo chưa đọc
   */
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadNotifications();
      if (response.data.isSuccess) {
        return response.data.data || [];
      }
      return [];
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      return [];
    }
  }, []);

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data.isSuccess) {
        setUnreadCount(response.data.data || 0);
        return response.data.data || 0;
      }
      return 0;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, []);

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationApi.markAsRead(notificationId);
      if (response.data.isSuccess) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        // Refresh unread count
        await fetchUnreadCount();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [fetchUnreadCount]);

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.data.isSuccess) {
        // Update all notifications as read
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  /**
   * Xóa một thông báo
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationApi.deleteNotification(notificationId);
      if (response.data.isSuccess) {
        // Remove from local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Refresh unread count
        await fetchUnreadCount();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [fetchUnreadCount]);

  /**
   * Xóa tất cả thông báo đã đọc
   */
  const deleteAllRead = useCallback(async () => {
    const readNotifications = notifications.filter((n) => n.isRead);
    for (const notification of readNotifications) {
      await deleteNotification(notification.id);
    }
  }, [notifications, deleteNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  };
};
