// Review - CREATE
export interface ReviewCreateDto {
  orderItemId: string; // Guid
  rating: number; // 1 - 5
  comment?: string;
}

// Review - UPDATE
export interface ReviewUpdateDto {
  rating: number; // 1 - 5
  comment?: string;
}

// Review - HISTORY (Customer)
export interface ReviewHistoryResponseDto {
  id: string;
  productId : string;
  productName: string;
  productImageUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isHidden: boolean;
}

// Review - PRODUCT (Public)
export interface ProductReviewDto {
  customerName: string;
  avatarUrl: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Review - ADMIN
export interface AdminReviewDto {
  id: string;
  customerId: string;
  customerName: string;
  avatarUrl: string;
  productName: string;
  rating: number;
  comment?: string;
  isHidden: boolean;
  createdAt: string;
  orderItemId: string;
}

// Review - REPORT (Admin)
export interface ReviewReportDto {
  totalReviews: number;
  averageRating: number;
  starCounts: Record<number, number>;
  hiddenReviewsCount: number;
}
export interface ReviewFilterModel {
  rating?: number;
  isHidden?: boolean;
  page: number;
  pageSize: number;
}
export interface MyReviewFillerModal {
  page: number;
  pageSize: number;
}
