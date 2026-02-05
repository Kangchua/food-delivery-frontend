import { OrderStatus, PaymentMethod, PaymentStatus} from './enum';

// Order Item (snapshot of cart item at order time)
// export interface OrderItem {
//   id: string;
//   productId: string;
//   productName: string;
//   productImage: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
//   note?: string;
// }

// // Order
// export interface Order {
//   id: string;
//   orderNumber: string;     // Mã đơn hàng (e.g., #ORD-001234)
//   userId: string;
//   user?: User;
  
//   // Items
//   items: OrderItem[];
  
//   // Delivery Address
//   address: Address;
  
//   // Pricing
//   subtotal: number;        // Tổng tiền hàng
//   deliveryFee: number;     // Phí giao hàng
//   discount?: number;       // Giảm giá (nếu có)
//   totalAmount: number;     // Tổng thanh toán
  
//   // Status
//   status: OrderStatus;
//   statusHistory: OrderStatusHistory[];
  
//   // Payment
//   paymentMethod: PaymentMethod;
//   paymentStatus: PaymentStatus;
  
//   // Delivery
//   shipperId?: string;
//   shipper?: User;
//   deliveryStatus?: DeliveryStatus;
//   deliveryNote?: string;
//   estimatedDeliveryTime?: string;
//   actualDeliveryTime?: string;
  
//   // Notes
//   note?: string;           // Ghi chú từ khách hàng
//   cancelReason?: string;   // Lý do hủy đơn
  
//   // Timestamps
//   createdAt: string;
//   updatedAt: string;
// }

// // Order Status History
// export interface OrderStatusHistory {
//   status: OrderStatus;
//   timestamp: string;
//   note?: string;
//   updatedBy?: string;      // ID của người cập nhật
// }

// // Order Review
// export interface OrderReview {
//   id: string;
//   orderId: string;
//   userId: string;
//   rating: number;          // 1-5
//   comment?: string;
//   createdAt: string;
// }

// // Create Order
// export interface CreateOrderRequest {
//   addressId: string;
//   paymentMethod: PaymentMethod;
//   note?: string;
// }

// // Update Order Status (Admin)
// export interface UpdateOrderStatusRequest {
//   orderId: string;
//   status: OrderStatus;
//   note?: string;
// }

// // Assign Shipper (Admin)
// export interface AssignShipperRequest {
//   orderId: string;
//   shipperId: string;
// }

// // Update Delivery Status (Shipper)
// export interface UpdateDeliveryStatusRequest {
//   orderId: string;
//   deliveryStatus: DeliveryStatus;
//   note?: string;
// }

// // Cancel Order
// export interface CancelOrderRequest {
//   orderId: string;
//   reason: string;
// }

// // Order Filters
// export interface OrderFilter {
//   status?: OrderStatus;
//   paymentStatus?: PaymentStatus;
//   paymentMethod?: PaymentMethod;
//   shipperId?: string;
//   fromDate?: string;
//   toDate?: string;
//   search?: string;         // Search by order number
//   page?: number;
//   limit?: number;
// }

//history response
export interface OrderItemSummary {
  orderId: string;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  shippingFee: number;
  estimatedDeliveryTime: string | null;
  currentStatus: OrderStatus; 
}

// 1. Chi tiết từng món ăn trong đơn hàng
export interface OrderItemResponse {
  productId: string; 
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isRemoved: boolean;
  removeReason?: string; 
}
// 2. Lịch sử thay đổi trạng thái đơn hàng
export interface OrderStatusHistoryResponse {
  status: OrderStatus; 
  changedAt: string;   
  changedBy: string;
  note: string;
}

// 3. Toàn bộ chi tiết đơn hàng
export interface OrderDetailResponse {
  orderId: string;
  orderCode: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  shippingFee: number;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  currentStatus: OrderStatus;
  cancelReason?: string;
  totalAmount: number;
  items: OrderItemResponse[];
  statusHistories: OrderStatusHistoryResponse[];
  shipperId?: string;
  
}
export interface OrderFilterModel {
  status?: OrderStatus;
  searchCode?: string;
  fromDate?: string; 
  toDate?: string;
  page: number;
  pageSize: number;
}
export interface OrderAdminSummaryResponse {
  id: string; 
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; 
  paymentMethod: PaymentMethod;
}
export interface OutOfStockRequest {
  removedProductIds: string[];
  note: string;
}