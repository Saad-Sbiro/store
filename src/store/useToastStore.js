// ─────────────────────────────────────────────
// FILE: src/store/useToastStore.js
// ─────────────────────────────────────────────

import { create } from 'zustand';

let idCounter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  /**
   * toast({ title, description, variant })
   * variant: 'default' | 'success' | 'error' | 'warning'
   * Returns the toast id so caller can dismiss it early.
   */
  toast: ({ title, description, variant = 'default', duration = 3500 }) => {
    const id = ++idCounter;
    set((s) => ({ toasts: [...s.toasts, { id, title, description, variant }] }));
    setTimeout(() => get().dismiss(id), duration);
    return id;
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  dismissAll: () => set({ toasts: [] }),
}));

// ── Convenience helpers exported at module level ──
export const toast = (opts) => useToastStore.getState().toast(opts);
