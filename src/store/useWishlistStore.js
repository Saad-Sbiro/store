// ─────────────────────────────────────────────
// FILE: src/store/useWishlistStore.js
// ─────────────────────────────────────────────

import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  ids: [],

  toggleWishlist: (id) =>
    set((state) => ({
      ids: state.ids.includes(id)
        ? state.ids.filter((i) => i !== id)
        : [...state.ids, id],
    })),

  isWishlisted: (id) => get().ids.includes(id),

  totalWishlisted: () => get().ids.length,
}));
