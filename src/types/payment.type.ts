import { PaymentMethod, PaymentStatus } from './enum';

// Payment
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;   // Mã giao dịch từ cổng thanh toán
  paymentUrl?: string;      // URL thanh toán (cho online payment)
  paidAt?: string;          // Thời gian thanh toán
  createdAt: string;
  updatedAt: string;
}

// Payment Request
export interface CreatePaymentRequest {
  orderId: string;
  method: PaymentMethod;
  returnUrl?: string;       // URL callback sau thanh toán
}

// Payment Response
export interface PaymentResponse {
  success: boolean;
  payment?: Payment;
  paymentUrl?: string;      // Redirect URL for online payment
  message?: string;
}

// Payment Verification (callback from payment gateway)
export interface VerifyPaymentRequest {
  orderId: string;
  transactionId: string;
  status: string;
  signature?: string;       // For security verification
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment?: Payment;
  message?: string;
}

// Refund
export interface RefundRequest {
  paymentId: string;
  amount?: number;          // Partial refund amount
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  message?: string;
}
