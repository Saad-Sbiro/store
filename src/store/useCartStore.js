// ─────────────────────────────────────────────
// FILE: src/store/useCartStore.js
// ─────────────────────────────────────────────

import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  addItem: (product, quantity = 1, color, size) => {
    const existing = get().items.find(
      (i) => i.id === product.id && i.color === color && i.size === size
    );
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        ),
      }));
    } else {
      set((state) => ({
        items: [...state.items, { ...product, quantity, color, size }],
      }));
    }
  },

  removeItem: (id, color, size) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.id === id && i.color === color && i.size === size)
      ),
    })),

  updateQuantity: (id, color, size, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter(
              (i) => !(i.id === id && i.color === color && i.size === size)
            )
          : state.items.map((i) =>
              i.id === id && i.color === color && i.size === size
                ? { ...i, quantity }
                : i
            ),
    })),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
