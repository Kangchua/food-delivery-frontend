// User Roles
export enum UserRole {
  ADMIN = "admin",
  SHIPPER = "shipper",
  STAFF = "staff",
  CUSTOMER = "customer",
}

// Order Status
export enum OrderStatus {
  Pending = 1,
  WaitingCustomerDecision = 2,
  Confirmed = 3,
  Preparing = 4,
  ReadyForPickup = 5,
  Shipping = 6,
  Completed = 7,
  Cancelled = 8,
}

// Payment Methods
export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  Momo = 2,
}

// Payment Status
export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
  Refunded = 2,
}

// Helper lấy nhãn và màu cho OrderStatus
export const getOrderStatusInfo = (status: OrderStatus) => {
  const map: Record<OrderStatus, { label: string; color: string }> = {
    [OrderStatus.Pending]: { label: "Chờ xác nhận", color: "bg-yellow-500" },
    [OrderStatus.WaitingCustomerDecision]: {
      label: "Chờ khác xác nhận",
      color: "bg-yellow-700",
    },
    [OrderStatus.Confirmed]: { label: "Đã xác nhận", color: "bg-blue-500" },
    [OrderStatus.Preparing]: { label: "Đang chuẩn bị", color: "bg-blue-500" },
    [OrderStatus.ReadyForPickup]: {
      label: "Sẵn sàng giao",
      color: "bg-blue-500",
    },
    [OrderStatus.Shipping]: { label: "Đang giao", color: "bg-purple-500" },
    [OrderStatus.Completed]: { label: "Đã giao", color: "bg-green-500" },
    [OrderStatus.Cancelled]: { label: "Đã hủy", color: "bg-red-500" },
  };
  return (
    map[status] || {
      label: "Không xác định",
      color: "bg-gray-50 text-gray-400",
    }
  );
};

// Helper lấy nhãn cho PaymentMethod
export const getPaymentMethodLabel = (method: PaymentMethod) => {
  const map: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: "Tiền mặt",
    [PaymentMethod.Card]: "Thẻ ngân hàng",
    [PaymentMethod.Momo]: "Ví MoMo",
  };
  return map[method] || "Khác";
};
