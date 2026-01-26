/**
 * Admin API - gọi đúng backend .NET (api/products, api/categories, api/Orders)
 * Id dùng string (Guid) cho product, category, order.
 */
import axiosClient from './axiosClient';

// ----- Backend enums (số) -----
export const OrderStatusEnum = {
  Pending: 1,
  WaitingCustomerDecision: 2,
  Confirmed: 3,
  Preparing: 4,
  ReadyForPickup: 5,
  Shipping: 6,
  Completed: 7,
  Cancelled: 8,
} as const;
export type OrderStatusNumber = (typeof OrderStatusEnum)[keyof typeof OrderStatusEnum];

export const OrderStatusLabel: Record<number, string> = {
  1: 'Chờ xác nhận',
  2: 'Chờ khách quyết định',
  3: 'Đã xác nhận',
  4: 'Đang chuẩn bị',
  5: 'Sẵn sàng giao',
  6: 'Đang giao',
  7: 'Hoàn thành',
  8: 'Đã hủy',
};

export interface ApiResult<T = unknown> {
  isSuccess: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ----- Products (api/products) -----
export interface AdminProduct {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ProductCreatePayload {
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface ProductUpdatePayload {
  name: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

// ----- Categories (api/categories) -----
export interface AdminCategory {
  id: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CategoryCreatePayload {
  name: string;
  description?: string | null;
  displayOrder?: number;
}

export interface CategoryUpdatePayload {
  name: string;
  description?: string | null;
  displayOrder?: number;
}

// ----- Orders admin (api/Orders) -----
export interface OrderAdminSummary {
  id: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: number;
  createdAt: string;
  paymentMethod: number;
}

export interface OrderAdminFilter {
  status?: number;
  searchCode?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

function normalizeProducts(data: unknown): AdminProduct[] {
  const raw = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
  return raw.map((p: any) => ({
    id: String(p.id ?? p.Id ?? ''),
    categoryId: String(p.categoryId ?? p.CategoryId ?? ''),
    categoryName: p.categoryName ?? p.CategoryName ?? '',
    name: p.name ?? p.Name ?? '',
    price: Number(p.price ?? p.Price ?? 0),
    imageUrl: p.imageUrl ?? p.ImageUrl ?? null,
    isAvailable: p.isAvailable ?? p.IsAvailable ?? true,
    isFeatured: p.isFeatured ?? p.IsFeatured ?? false,
    displayOrder: Number(p.displayOrder ?? p.DisplayOrder ?? 0),
    createdAt: p.createdAt ?? p.CreatedAt,
    updatedAt: p.updatedAt ?? p.UpdatedAt,
  }));
}

function normalizeCategories(data: unknown): AdminCategory[] {
  const raw = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
  return raw.map((c: any) => ({
    id: String(c.id ?? c.Id ?? ''),
    name: c.name ?? c.Name ?? '',
    description: c.description ?? c.Description ?? null,
    displayOrder: Number(c.displayOrder ?? c.DisplayOrder ?? 0),
    createdAt: c.createdAt ?? c.CreatedAt,
    updatedAt: c.updatedAt ?? c.UpdatedAt,
  }));
}

function normalizeOrderAdminList(res: any): { items: OrderAdminSummary[]; total: number; meta?: PaginationMeta } {
  const d = res?.data ?? res;
  const list = Array.isArray(d) ? d : d?.data ?? [];
  const meta = d?.meta ?? (res?.data?.meta ?? { totalCount: list.length, page: 1, pageSize: list.length, totalPages: 1 });
  const items: OrderAdminSummary[] = list.map((o: any) => ({
    id: String(o.id ?? o.Id ?? ''),
    orderCode: o.orderCode ?? o.OrderCode ?? '',
    customerName: o.customerName ?? o.CustomerName ?? '',
    totalAmount: Number(o.totalAmount ?? o.TotalAmount ?? 0),
    status: Number(o.status ?? o.Status ?? 0),
    createdAt: o.createdAt ?? o.CreatedAt ?? '',
    paymentMethod: Number(o.paymentMethod ?? o.PaymentMethod ?? 0),
  }));
  return {
    items,
    total: meta?.totalCount ?? meta?.TotalCount ?? items.length,
    meta: meta?.totalCount !== undefined ? meta : undefined,
  };
}

export const adminApi = {
  products: {
    getAll: async (params?: { categoryId?: string; q?: string }) => {
      const r = await axiosClient.get<unknown>('/products', { params: params || {} });
      return normalizeProducts(r.data);
    },
    getById: async (id: string) => {
      const r = await axiosClient.get<unknown>(`/products/${id}`);
      const raw = (r.data as any)?.data ?? r.data;
      if (!raw) return null;
      const p = raw;
      return {
        id: String(p.id ?? p.Id ?? ''),
        categoryId: String(p.categoryId ?? p.CategoryId ?? ''),
        categoryName: p.categoryName ?? p.CategoryName ?? '',
        name: p.name ?? p.Name ?? '',
        price: Number(p.price ?? p.Price ?? 0),
        imageUrl: p.imageUrl ?? p.ImageUrl ?? null,
        isAvailable: p.isAvailable ?? p.IsAvailable ?? true,
        isFeatured: p.isFeatured ?? p.IsFeatured ?? false,
        displayOrder: Number(p.displayOrder ?? p.DisplayOrder ?? 0),
      } as AdminProduct;
    },
    create: async (payload: ProductCreatePayload) => {
      const body = {
        categoryId: payload.categoryId,
        name: payload.name,
        price: payload.price,
        imageUrl: payload.imageUrl ?? null,
        isAvailable: payload.isAvailable ?? true,
        isFeatured: payload.isFeatured ?? false,
        displayOrder: payload.displayOrder ?? 0,
      };
      const r = await axiosClient.post<unknown>('/products', body);
      return (r.data as any)?.data ?? r.data;
    },
    update: async (id: string, payload: ProductUpdatePayload) => {
      await axiosClient.put(`/products/${id}`, {
        name: payload.name,
        price: payload.price,
        imageUrl: payload.imageUrl ?? null,
        isAvailable: payload.isAvailable,
        isFeatured: payload.isFeatured,
        displayOrder: payload.displayOrder,
      });
    },
    toggleAvailability: async (id: string) => {
      await axiosClient.patch(`/products/${id}/toggle`);
    },
    delete: async (id: string) => {
      await axiosClient.delete(`/products/${id}`);
    },
  },

  categories: {
    getAll: async () => {
      const r = await axiosClient.get<unknown>('/categories');
      return normalizeCategories(r.data);
    },
    getById: async (id: string) => {
      const r = await axiosClient.get<unknown>(`/categories/${id}`);
      const raw = (r.data as any)?.data ?? r.data;
      if (!raw) return null;
      const c = raw;
      return {
        id: String(c.id ?? c.Id ?? ''),
        name: c.name ?? c.Name ?? '',
        description: c.description ?? c.Description ?? null,
        displayOrder: Number(c.displayOrder ?? c.DisplayOrder ?? 0),
      } as AdminCategory;
    },
    create: async (payload: CategoryCreatePayload) => {
      const body = {
        name: payload.name,
        description: payload.description ?? null,
        displayOrder: payload.displayOrder ?? 0,
      };
      const r = await axiosClient.post<unknown>('/categories', body);
      return (r.data as any)?.data ?? r.data;
    },
    update: async (id: string, payload: CategoryUpdatePayload) => {
      await axiosClient.put(`/categories/${id}`, {
        name: payload.name,
        description: payload.description ?? null,
        displayOrder: payload.displayOrder ?? 0,
      });
    },
    delete: async (id: string) => {
      await axiosClient.delete(`/categories/${id}`);
    },
  },

  orders: {
    getAdminList: async (filter?: OrderAdminFilter) => {
      const params: Record<string, string | number | undefined> = {
        page: filter?.page ?? 1,
        pageSize: filter?.pageSize ?? 10,
      };
      if (filter?.status != null) params.status = filter.status;
      if (filter?.searchCode) params.searchCode = filter.searchCode;
      if (filter?.fromDate) params.fromDate = filter.fromDate;
      if (filter?.toDate) params.toDate = filter.toDate;
      const r = await axiosClient.get<unknown>('/Orders/admin', { params });
      const res = r.data as ApiResult<PagedResponse<OrderAdminSummary>>;
      if (res && !res.isSuccess && res.errorCode) {
        throw new Error(res.message || 'Lỗi tải đơn hàng');
      }
      return normalizeOrderAdminList(r.data);
    },
    getDetail: async (orderId: string) => {
      const r = await axiosClient.get<ApiResult<unknown>>(`/Orders/${orderId}`);
      if ((r.data as ApiResult)?.isSuccess === false) throw new Error((r.data as ApiResult).message);
      return (r.data as ApiResult).data ?? r.data;
    },
    confirm: async (orderId: string) => {
      const r = await axiosClient.post<ApiResult>(`/Orders/${orderId}/admin/confirm`);
      if (r.data && !(r.data as ApiResult).isSuccess) {
        throw new Error((r.data as ApiResult).message || 'Xác nhận thất bại');
      }
    },
    outOfStock: async (orderId: string, payload: { removedProductIds: string[]; note: string }) => {
      const r = await axiosClient.post<ApiResult>(`/Orders/${orderId}/admin/out-of-stock`, {
        removedProductIds: payload.removedProductIds,
        note: payload.note,
      });
      if (r.data && !(r.data as ApiResult).isSuccess) {
        throw new Error((r.data as ApiResult).message || 'Báo hết món thất bại');
      }
    },
    startPreparing: async (orderId: string) => {
      const r = await axiosClient.post<ApiResult>(`/Orders/${orderId}/admin/start-preparing`);
      if (r.data && !(r.data as ApiResult).isSuccess) {
        throw new Error((r.data as ApiResult).message || 'Cập nhật thất bại');
      }
    },
    cancel: async (orderId: string, reason: string) => {
      const r = await axiosClient.post<ApiResult>(`/Orders/${orderId}/admin/cancel`, { reason });
      if (r.data && !(r.data as ApiResult).isSuccess) {
        throw new Error((r.data as ApiResult).message || 'Hủy đơn thất bại');
      }
    },
  },
};

export default adminApi;
