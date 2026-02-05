export type NotificationType = 'ORDER' | 'PAYMENT' | 'PROMOTION' | 'SYSTEM' | 'REVIEW' | 'DELIVERY';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationResponse {
  unreadCount: number;
  notifications: Notification[];
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: number; // 1=ORDER, 2=PAYMENT, 3=PROMOTION, 4=SYSTEM, 5=REVIEW, 6=DELIVERY
  link?: string;
}

export const NotificationTypeColor: Record<NotificationType, string> = {
  ORDER: 'bg-blue-50 border-blue-200',
  PAYMENT: 'bg-green-50 border-green-200',
  PROMOTION: 'bg-yellow-50 border-yellow-200',
  SYSTEM: 'bg-gray-50 border-gray-200',
  REVIEW: 'bg-purple-50 border-purple-200',
  DELIVERY: 'bg-orange-50 border-orange-200',
};

export const NotificationTypeIcon: Record<NotificationType, string> = {
  ORDER: '📦',
  PAYMENT: '💳',
  PROMOTION: '🎉',
  SYSTEM: '⚙️',
  REVIEW: '⭐',
  DELIVERY: '🚚',
};

export const NotificationTypeLabel: Record<NotificationType, string> = {
  ORDER: 'Đơn hàng',
  PAYMENT: 'Thanh toán',
  PROMOTION: 'Khuyến mãi',
  SYSTEM: 'Hệ thống',
  REVIEW: 'Đánh giá',
  DELIVERY: 'Giao hàng',
};
