// ─────────────────────────────────────────────
// FILE: src/utils/formatPrice.js
// ─────────────────────────────────────────────

export const formatPrice = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' DH';
};

export const calcSavings = (price, originalPrice) => {
  if (!originalPrice) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};
