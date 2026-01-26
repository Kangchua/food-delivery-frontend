import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/enum"; // Import enum số (1-8)
import { getStatusColor } from "@/utils/formatters";

interface OrderStatusBadgeProps {
  status: OrderStatus | number;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
}) => {
  // Hàm này trả về trực tiếp nội dung tiếng Việt
  const getStatusLabel = (s: number): string => {
    switch (s) {
      case OrderStatus.Pending:
        return "Chờ xác nhận";
      case OrderStatus.WaitingCustomerDecision:
        return "Chờ khách xác nhận";
      case OrderStatus.Confirmed:
        return "Đã xác nhận";
      case OrderStatus.Preparing:
        return "Đang nấu";
      case OrderStatus.ReadyForPickup:
        return "Chờ shipper";
      case OrderStatus.Shipping:
        return "Đang giao hàng";
      case OrderStatus.Completed:
        return "Hoàn tất";
      case OrderStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getStatusColor(status), // Màu sắc vẫn lấy từ formatter
        className,
      )}
    >
      {getStatusLabel(Number(status))}
    </span>
  );
};

export default OrderStatusBadge;
