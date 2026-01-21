// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;  // Giá gốc (nếu có giảm giá)
  image: string;
  images?: string[];       // Nhiều ảnh sản phẩm
  categoryId: string;
  category?: Category;
  isAvailable: boolean;
  isFeatured: boolean;     // Sản phẩm nổi bật
  soldCount?: number;      // Số lượng đã bán
  rating?: number;         // Đánh giá trung bình
  reviewCount?: number;    // Số lượng đánh giá
  createdAt: string;
  updatedAt: string;
}

// Category CRUD
export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// Product CRUD
export interface CreateProductRequest {
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  categoryId: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// Product Filters
export interface ProductFilter {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'soldCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
