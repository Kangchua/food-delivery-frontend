import { OrderStatus, PaymentMethod, PaymentStatus, DeliveryStatus } from './enum';
import { CartItem } from './cart.type';
import { User, Address } from './user.type';

// Order Item (snapshot of cart item at order time)
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

// Order
export interface Order {
  id: string;
  orderNumber: string;     // Mã đơn hàng (e.g., #ORD-001234)
  userId: string;
  user?: User;
  
  // Items
  items: OrderItem[];
  
  // Delivery Address
  address: Address;
  
  // Pricing
  subtotal: number;        // Tổng tiền hàng
  deliveryFee: number;     // Phí giao hàng
  discount?: number;       // Giảm giá (nếu có)
  totalAmount: number;     // Tổng thanh toán
  
  // Status
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Delivery
  shipperId?: string;
  shipper?: User;
  deliveryStatus?: DeliveryStatus;
  deliveryNote?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  
  // Notes
  note?: string;           // Ghi chú từ khách hàng
  cancelReason?: string;   // Lý do hủy đơn
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Order Status History
export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;      // ID của người cập nhật
}

// Order Review
export interface OrderReview {
  id: string;
  orderId: string;
  userId: string;
  rating: number;          // 1-5
  comment?: string;
  createdAt: string;
}

// Create Order
export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

// Update Order Status (Admin)
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  note?: string;
}

// Assign Shipper (Admin)
export interface AssignShipperRequest {
  orderId: string;
  shipperId: string;
}

// Update Delivery Status (Shipper)
export interface UpdateDeliveryStatusRequest {
  orderId: string;
  deliveryStatus: DeliveryStatus;
  note?: string;
}

// Cancel Order
export interface CancelOrderRequest {
  orderId: string;
  reason: string;
}

// Order Filters
export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shipperId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;         // Search by order number
  page?: number;
  limit?: number;
}
