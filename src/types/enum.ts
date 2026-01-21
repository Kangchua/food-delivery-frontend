// User Roles
export enum UserRole {
  ADMIN = 'admin',
  SHIPPER = 'shipper',
  CUSTOMER = 'customer',
}

// Order Status
export enum OrderStatus {
  PENDING = 'pending',           // Chờ xác nhận
  CONFIRMED = 'confirmed',       // Đã xác nhận
  PREPARING = 'preparing',       // Đang chuẩn bị
  READY = 'ready',               // Sẵn sàng giao
  OUT_FOR_DELIVERY = 'out_for_delivery', // Đang giao hàng
  DELIVERED = 'delivered',       // Đã giao
  CANCELLED = 'cancelled',       // Đã hủy
}

// Payment Methods
export enum PaymentMethod {
  COD = 'cod',                   // Thanh toán khi nhận hàng
  MOMO = 'momo',                 // Ví MoMo
  VNPAY = 'vnpay',               // VNPay
  BANK_TRANSFER = 'bank_transfer', // Chuyển khoản ngân hàng
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',           // Chờ thanh toán
  COMPLETED = 'completed',       // Đã thanh toán
  FAILED = 'failed',             // Thanh toán thất bại
  REFUNDED = 'refunded',         // Đã hoàn tiền
}

// Delivery Status (for shipper)
export enum DeliveryStatus {
  ASSIGNED = 'assigned',         // Đã gán shipper
  PICKED_UP = 'picked_up',       // Đã lấy hàng
  ON_THE_WAY = 'on_the_way',     // Đang trên đường giao
  DELIVERED = 'delivered',       // Đã giao thành công
  FAILED = 'failed',             // Giao hàng thất bại
}
