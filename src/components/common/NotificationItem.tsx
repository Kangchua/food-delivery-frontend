import { Notification } from '@/types/notification.type';
import { NotificationTypeColor, NotificationTypeIcon, NotificationTypeLabel } from '@/types/notification.type';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) => {
  return (
    <div
      className={cn(
        'p-4 border-l-4 hover:bg-gray-50 transition-colors',
        notification.isRead ? 'border-l-gray-200 bg-white' : 'border-l-blue-500 bg-blue-50'
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {NotificationTypeIcon[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {notification.title}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {notification.message}
              </p>
            </div>
            {!notification.isRead && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex gap-2">
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
              <span className="font-medium text-gray-600">
                {NotificationTypeLabel[notification.type]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Đánh dấu đã đọc
              </button>
            )}
            {notification.link && (
              <a
                href={notification.link}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Xem chi tiết →
              </a>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
