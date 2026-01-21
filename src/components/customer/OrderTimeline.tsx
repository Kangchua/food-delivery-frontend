import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatusHistoryItem } from '@/api/orderApi';

interface OrderTimelineProps {
  statusHistory?: StatusHistoryItem[];
}

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-500' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500' },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-blue-500' },
  ready: { label: 'Sẵn sàng giao', color: 'bg-blue-500' },
  outForDelivery: { label: 'Đang giao', color: 'bg-purple-500' },
  delivered: { label: 'Đã giao', color: 'bg-green-500' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500' },
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ statusHistory = [] }) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Chưa có cập nhật trạng thái
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusHistory.map((item, index) => {
        const config = statusConfig[item.status as keyof typeof statusConfig];
        const isLast = index === statusHistory.length - 1;

        return (
          <div key={index} className="flex gap-4">
            {/* Timeline Dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center',
                  config?.color || 'bg-gray-300',
                  index === statusHistory.length - 1 && 'ring-2 ring-offset-2 ring-primary'
                )}
              >
                {index === statusHistory.length - 1 ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <Circle className="h-5 w-5 text-white" />
                )}
              </div>
              {!isLast && (
                <div className="w-1 flex-1 min-h-12 bg-gray-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4">
              <p className="font-semibold text-foreground">
                {config?.label || item.status}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.timestamp).toLocaleString('vi-VN')}
              </p>
              {item.note && (
                <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
