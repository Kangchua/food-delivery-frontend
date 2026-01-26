import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '@/api/dataApi';
import { useAuth } from '@/context/AuthContext';
import cartApi from '@/api/cartApi';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE = 15000;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Load cart from DB when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromDB();
    }
  }, [isAuthenticated]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      localStorage.removeItem('cart');
    }
  }, [isAuthenticated]);

  const loadCartFromDB = async () => {
    try {
      const cartData = await cartApi.get();
      
      if (cartData && cartData.items) {
        // Convert CartItemDto to CartItem format (with product object)
        const convertedItems = cartData.items.map((item: any) => ({
          id: item.id,
          product: {
            id: item.productId,
            name: item.name,
            description: '',
            price: item.price,
            image: item.imageUrl || '',
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            rating: 0,
            soldCount: 0,
            isAvailable: true,
          },
          quantity: item.quantity,
        }));
        setItems(convertedItems);
      }
    } catch (error) {
      console.error('Error loading cart from DB:', error);
      // Fallback to localStorage if DB fails
      const saved = localStorage.getItem('cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: Date.now().toString(), product, quantity }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
