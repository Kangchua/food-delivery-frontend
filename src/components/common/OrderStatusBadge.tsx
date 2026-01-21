import React from 'react';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';
import { OrderStatus } from '@/api/dataApi';
import { getStatusColor } from '@/utils/formatters';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();

  const statusKey = `orderStatus.${status}` as const;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        getStatusColor(status),
        className
      )}
    >
      {t(statusKey)}
    </span>
  );
};

export default OrderStatusBadge;
