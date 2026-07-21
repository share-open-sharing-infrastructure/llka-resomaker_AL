"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { Item, getAvailableCopies } from "@/lib/types/item";
import { useConfig } from "@/context/config-context";

function clampQuantity(quantity: number, item: Item): number {
  return Math.min(Math.max(1, quantity), getAvailableCopies(item));
}

interface CartContextType {
  items: Item[];
  quantities: Record<string, number>;
  addItem: (item: Item, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  getQuantity: (itemId: string) => number;
  clearCart: () => void;
  isInCart: (itemId: string) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "leihlokal-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const config = useConfig();
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // legacy format: plain array of items
          setItems(parsed);
        } else if (parsed && Array.isArray(parsed.items)) {
          const items: Item[] = parsed.items;
          const storedQuantities: Record<string, number> = parsed.quantities || {};
          const clamped: Record<string, number> = {};
          for (const item of items) {
            if (item.id in storedQuantities) {
              clamped[item.id] = clampQuantity(storedQuantities[item.id], item);
            }
          }
          setItems(items);
          setQuantities(clamped);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage when items or quantities change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, quantities }));
    }
  }, [items, quantities, isHydrated]);

  const addItem = useCallback((item: Item, quantity = 1) => {
    let added = false;
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev;
      }
      // Check cart limit (0 = unlimited)
      if (config.limits.cartItems > 0 && prev.length >= config.limits.cartItems) {
        toast.error(`Maximal ${config.limits.cartItems} Gegenstände im Ausleihkorb erlaubt`);
        return prev;
      }
      added = true;
      return [...prev, item];
    });
    if (added) {
      setQuantities((prev) => ({ ...prev, [item.id]: clampQuantity(quantity, item) }));
    }
  }, [config.limits.cartItems]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setQuantities((prev) => {
      const item = items.find((i) => i.id === itemId);
      return { ...prev, [itemId]: item ? clampQuantity(quantity, item) : quantity };
    });
  }, [items]);

  const getQuantity = useCallback(
    (itemId: string) => quantities[itemId] ?? 1,
    [quantities]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setQuantities({});
  }, []);

  const isInCart = useCallback(
    (itemId: string) => {
      return items.some((item) => item.id === itemId);
    },
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        quantities,
        addItem,
        removeItem,
        setQuantity,
        getQuantity,
        clearCart,
        isInCart,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
