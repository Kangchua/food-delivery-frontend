import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '@/api/dataApi';
import { useAuth } from '@/context/AuthContext';
import cartApi from '@/api/cartApi';
import { UserRole } from '@/types/enum';

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
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Load cart from DB when user logs in
  useEffect(() => {
    if (isAuthenticated && user && user.role !== UserRole.SHIPPER) {
      loadCartFromDB();
    }
  }, [isAuthenticated, user]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      // Don't remove from localStorage until they log back in
    }
  }, [isAuthenticated]);

  const loadCartFromDB = async () => {
    try {
      const cartData = await cartApi.get();
      
      if (cartData && cartData.items && Array.isArray(cartData.items)) {
        // Convert CartItemDto to CartItem format (with product object)
        const convertedItems = cartData.items.map((item: any) => ({
          id: item.id || item.id.toString(), // CartItem ID from database
          product: {
            id: item.productId,
            name: item.productName,
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
      // Use product ID as cart item ID temporarily (will be replaced with DB ID after sync)
      return [...prev, { id: product.id, product, quantity }];
    });
    
    // Sync to database if authenticated and reload cart to get real IDs
    if (isAuthenticated && user && user.role !== UserRole.SHIPPER) {
      cartApi.addItem(product.id, quantity)
        .then(() => {
          // Reload cart from DB to get actual cart item IDs
          loadCartFromDB();
        })
        .catch(error => {
          console.error('Failed to sync cart item to database:', error);
        });
    }
  };

  const removeItem = (itemId: string) => {
    // Find the product ID to call the API
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Remove from state immediately for better UX
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    // Sync to database if authenticated
    if (isAuthenticated) {
      cartApi
        .removeItem(item.product.id)
        .catch((error) => {
          console.error('Failed to remove item from database:', error);
          // Reload cart from DB to sync state if removal failed
          loadCartFromDB();
        });
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    // Find the product ID
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Update state immediately
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );

    // Sync to database if authenticated
    if (isAuthenticated) {
      cartApi
        .updateQuantity(item.product.id, quantity)
        .catch((error) => {
          console.error('Failed to update quantity in database:', error);
          // Reload cart from DB to sync state if update failed
          loadCartFromDB();
        });
    }
  };

  const clearCart = () => {
    setItems([]);

    // Sync to database if authenticated
    if (isAuthenticated) {
      cartApi.clear().catch((error) => {
        console.error('Failed to clear cart in database:', error);
      });
    }
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
