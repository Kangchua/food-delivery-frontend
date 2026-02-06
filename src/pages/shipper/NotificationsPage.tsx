import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import notificationApi from '@/api/notificationApi';
import { NotificationResponse } from '@/types/notification.type';
import { toast } from 'sonner';
import { format } from 'date-fns';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications();
      const notificationsData = response?.data?.data || response?.data || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Không thể đánh dấu tất cả đã đọc');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Thông báo</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              variant="outline"
              size="sm"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {markingAll ? 'Đang đánh dấu...' : 'Đánh dấu tất cả đã đọc'}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Không có thông báo nào</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition-colors ${
                  notification.isRead
                    ? 'bg-card border-border'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${!notification.isRead ? 'text-primary' : ''}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      onClick={() => handleMarkAsRead(notification.id)}
                      size="sm"
                      variant="ghost"
                      className="ml-4"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;