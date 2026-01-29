import {
  OrderAdminSummaryResponse,
  OrderDetailResponse,
  OrderFilterModel,
  OrderItemSummary,
  OutOfStockRequest,
  PaginatedResponse,
} from "@/types";
import axiosClient from "./axiosClient";
import { ApiResult, ApiResultNoData, PageResponse } from "@/types/page";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "outForDelivery"
  | "delivered"
  | "cancelled";

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  price?: number; // calculated from unitPrice * quantity
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "cod" | "momo" | "vnpay" | "bank";
  deliveryAddress: string;
  note?: string;
  shipperId?: string;
  shipperName?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusHistoryItem[];
}

export interface CreateOrderRequest {
  deliveryAddress: string;
  note?: string;
  paymentMethod: "cod" | "momo" | "vnpay" | "bank";
}

export interface CheckoutRequest {
  addressId: string;
  cartItemIds: string[];
  note?: string;
  paymentMethod?: "cod" | "momo" | "vnpay" | "bank";
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
}

export interface ShippingFeeResponse {
  shippingFee: number;
  distance: number;
  estimatedMinutes: number;
}

export const orderApi = {
  // Tạo đơn hàng
  create: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      const response = await axiosClient.post<Order | ApiResult<Order>>(
        "/orders",
        data,
      );

      // Handle both plain object and wrapped response
      if ("id" in response.data && "orderNumber" in response.data) {
        return response.data as Order;
      }

      const wrappedData = response.data as ApiResult<Order>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || "Lỗi tạo đơn hàng");
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },

  // Lấy danh sách đơn hàng
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await axiosClient.get<Order[] | ApiResult<Order[]>>(
        "/orders",
      );

      // Handle both plain array and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      }

      const wrappedData = response.data as ApiResult<Order[]>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || "Lỗi lấy danh sách đơn hàng");
      }
      return wrappedData.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },

  // Xác nhận giao hàng (shipper)
  confirmDelivery: async (id: string): Promise<Order> => {
    try {
      const response = await axiosClient.post<Order | ApiResult<Order>>(
        `/orders/${id}/confirm-delivery`,
      );

      // Handle both plain object and wrapped response
      if ("id" in response.data && "orderNumber" in response.data) {
        return response.data as Order;
      }

      const wrappedData = response.data as ApiResult<Order>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || "Lỗi xác nhận giao hàng");
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },

  // Thanh toán (checkout) với giỏ hàng
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      // Ensure IDs are properly formatted as strings for Guids
      // Filter out any empty or invalid cart item IDs
      const validCartItemIds = Array.isArray(data.cartItemIds) 
        ? data.cartItemIds.filter(id => id && id.trim().length > 0)
        : [];

      if (validCartItemIds.length === 0) {
        throw new Error("Giỏ hàng trống hoặc không có sản phẩm hợp lệ");
      }

      const checkoutData = {
        addressId: data.addressId,
        cartItemIds: validCartItemIds,
        note: data.note || "",
      };
      
      console.log('Checkout data:', checkoutData);
      
      const response = await axiosClient.post<
        CheckoutResponse | ApiResult<CheckoutResponse>
      >("/orders/checkout", checkoutData);

      // Handle both plain object and wrapped response
      if ("orderId" in response.data && "orderCode" in response.data) {
        return response.data as CheckoutResponse;
      }

      const wrappedData = response.data as ApiResult<CheckoutResponse>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || "Lỗi thanh toán");
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },

  getHistory: async (
    page = 1,
    pageSize = 10,
  ): Promise<PageResponse<OrderItemSummary>> => {
    try {
      const response = await axiosClient.get<
        ApiResult<PageResponse<OrderItemSummary>>
      >("/orders/history", {
        params: { page, pageSize },
      });
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi lấy lịch sử đơn hàng");
      }
      return result.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || "Lỗi kết nối";
      throw new Error(msg);
    }
  },
  // Lấy chi tiết đơn hàng
  getByOrderId: async (id: string): Promise<OrderDetailResponse> => {
    try {
      const response = await axiosClient.get<ApiResult<OrderDetailResponse>>(
        `/orders/${id}`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi lấy chi tiết đơn hàng");
      }
      return result.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },
  // Hủy đơn hàng
  cancel: async (id: string, reason: string): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/orders/${id}/cancel`,
        {
          reason,
        },
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi hủy đơn hàng");
      }
      return result.isSuccess;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },

  // Tiếp tục đơn với các món bị bỏ ra không
  respondProposal: async (
    id: string,
    isAccepted: boolean,
    note: string,
  ): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/orders/${id}/respond-proposal`,
        {
          isAccepted,
          note,
        },
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi xác nhận tiếp tục đơn hàng");
      }
      return result.isSuccess;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },
  getOrderByAdmin: async (
    filler: OrderFilterModel,
  ): Promise<PageResponse<OrderAdminSummaryResponse>> => {
    try {
      const response = await axiosClient.get<
        ApiResult<PageResponse<OrderAdminSummaryResponse>>
      >("/admin/orders", {
        params: filler,
      });
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi lấy đơn hàng");
      }
      return result.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  confirmOrderByAdmin: async (orderId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/admin/orders/${orderId}/confirm`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi xác nhận đơn hàng");
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  outOfStockByAdmin: async (
    orderId: string,
    request: OutOfStockRequest,
  ): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/admin/orders/${orderId}/out-of-stock`,
        request,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi chọn món ăn trong đơn hàng");
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  startPreparingByAdmin: async (orderId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/admin/orders/${orderId}/start-preparing`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(
          result.message || "Lỗi xác nhận nấu các món ăn của đơn hàng",
        );
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  finalPreparingByAdmin: async (orderId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/admin/orders/${orderId}/final-preparing`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(
          result.message || "Lỗi xác nhận món ăn nấu xong của đơn hàng",
        );
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  cancelByAdmin: async (id: string, reason: string): Promise<boolean> => {
    try {
      const response = await axiosClient.post<ApiResultNoData>(
        `/admin/orders/${id}/cancel`,
        {
          reason,
        },
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi hủy đơn hàng");
      }
      return result.isSuccess;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },

  // Tính phí vận chuyển dựa trên địa chỉ giao hàng
  calculateShippingFee: async (addressId: string, itemCount: number = 1): Promise<ShippingFeeResponse> => {
    try {
      const response = await axiosClient.get<
        ShippingFeeResponse | ApiResult<ShippingFeeResponse>
      >("/orders/shipping-fee", {
        params: { addressId, itemCount },
      });

      // Handle both plain object and wrapped response
      if ("shippingFee" in response.data) {
        return response.data as ShippingFeeResponse;
      }

      const wrappedData = response.data as ApiResult<ShippingFeeResponse>;
      if (!wrappedData.isSuccess) {
        throw new Error(wrappedData.message || "Lỗi tính phí vận chuyển");
      }
      return wrappedData.data!;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Lỗi kết nối server",
      );
    }
  },
};

export default orderApi;
