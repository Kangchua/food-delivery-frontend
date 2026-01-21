import { Product } from './product.type';

// Cart Item
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  note?: string;           // Ghi chú cho món ăn
  unitPrice: number;       // Giá tại thời điểm thêm vào giỏ
  totalPrice: number;      // quantity * unitPrice
}

// Cart
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;      // Tổng số lượng món
  totalAmount: number;     // Tổng tiền
  createdAt: string;
  updatedAt: string;
}

// Cart Actions
export interface AddToCartRequest {
  productId: string;
  quantity: number;
  note?: string;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
  note?: string;
}

export interface RemoveFromCartRequest {
  itemId: string;
}
