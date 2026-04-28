import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '@/types';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product) => void;
  incrementItem: (productId: number) => void;
  decrementItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'tgapp-cart';
const CartContext = createContext<CartContextValue | null>(null);

function readInitialCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      items,
      totalItems,
      totalPrice,
      addItem: product => {
        setItems(current => {
          const existingItem = current.find(item => item.product.id === product.id);
          if (existingItem) {
            return current.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
                : item
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      incrementItem: productId => {
        setItems(current =>
          current.map(item =>
            item.product.id === productId
              ? { ...item, quantity: Math.min(item.quantity + 1, item.product.stock) }
              : item
          )
        );
      },
      decrementItem: productId => {
        setItems(current =>
          current
            .map(item =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter(item => item.quantity > 0)
        );
      },
      removeItem: productId => {
        setItems(current => current.filter(item => item.product.id !== productId));
      },
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
