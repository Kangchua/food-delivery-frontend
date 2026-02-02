import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { useNotificationContext } from '@/context/NotificationContext';
import { NotificationTypeIcon, NotificationTypeLabel } from '@/types/notification.type';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationContext();
  const [filterUnread, setFilterUnread] = useState(false);

  const filteredNotifications = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="ml-auto inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={!filterUnread ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUnread(false)}
          >
            Tất cả ({notifications.length})
          </Button>
          <Button
            variant={filterUnread ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUnread(true)}
          >
            Chưa đọc ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              className="ml-auto"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {filterUnread ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (notification.link) {
                    navigate(notification.link);
                  }
                }}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  notification.isRead
                    ? 'border-border bg-muted/30'
                    : 'border-primary/50 bg-primary/5',
                  notification.link && 'cursor-pointer hover:bg-primary/10'
                )}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 items-center justify-center flex-shrink-0 text-2xl">
                    {NotificationTypeIcon[notification.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground break-words">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {NotificationTypeLabel[notification.type]}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-8 text-xs"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="ml-auto h-8 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Xóa
                      </Button>
                    </div>
                  </div>
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
