// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Select Option (for dropdowns)
export interface SelectOption<T = string> {
  label: string;
  value: T;
}

// Dashboard Statistics
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { productId: string; name: string; soldCount: number }[];
}

// Shipper Statistics
export interface ShipperStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
}
