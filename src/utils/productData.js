const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [trimmed];
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const getProductImages = (product = {}) => {
  const images = parseList(product.images);
  if (images.length) return images;

  return parseList(product.image || product.imageUrl || product.image_url || product.thumbnail);
};

export const getPrimaryProductImage = (product = {}) => getProductImages(product)[0] || '';

export const getProductColors = (product = {}) => {
  const colors = parseList(product.colors);
  return colors.length ? colors : ['#111111'];
};

export const getProductVariants = (product = {}) => {
  const variants = parseList(product.sizes || product.variants || product.options);
  return variants.length ? variants : ['Standard'];
};

export const getProductTags = (product = {}) => parseList(product.tags);

export const getProductPrice = (product = {}) => toNumber(product.price) ?? 0;

export const getProductOriginalPrice = (product = {}) => (
  toNumber(product.originalPrice ?? product.original_price)
);

export const getProductStock = (product = {}) => toNumber(product.stock);
