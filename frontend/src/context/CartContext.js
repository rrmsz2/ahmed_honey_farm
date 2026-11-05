import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cart';
const MAX_QUANTITY = 50;
const CartContext = createContext(null);

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => item?.id && item.quantity > 0) : [];
  } catch {
    return [];
  }
};

const snapshot = (product, quantity) => ({
  id: product.id,
  name_ar: product.name_ar,
  name_en: product.name_en,
  price: product.price,
  weight: product.weight,
  image_url: product.image_url,
  quantity,
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (!existing) return [...prev, snapshot(product, Math.min(quantity, MAX_QUANTITY))];
      return prev.map((item) =>
        item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) } : item,
      );
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== productId)
        : prev.map((item) => (item.id === productId ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item)),
    );
  }, []);

  const removeItem = useCallback((productId) => setItems((prev) => prev.filter((item) => item.id !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  /** Refresh names/prices from the live catalogue and drop unavailable products. Returns true if any were removed. */
  const syncWithCatalogue = useCallback(
    (products) => {
      const byId = new Map(products.map((p) => [p.id, p]));
      const next = items.flatMap((item) => (byId.has(item.id) ? [snapshot(byId.get(item.id), item.quantity)] : []));
      setItems(next);
      return next.length !== items.length;
    },
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1000) / 1000,
      addItem,
      setQuantity,
      removeItem,
      clear,
      syncWithCatalogue,
      maxQuantity: MAX_QUANTITY,
    }),
    [items, addItem, setQuantity, removeItem, clear, syncWithCatalogue],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
