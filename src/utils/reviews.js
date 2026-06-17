const PENDING_REVIEW_ORDERS_KEY = 'voidstore_pending_review_orders';
const PRODUCT_REVIEWS_KEY = 'voidstore_product_reviews';
const REVIEW_UNLOCK_DELAY_MS = 1000 * 60 * 60 * 48;
const REVIEW_READY_STATUSES = new Set(['shipped', 'delivered']);

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizeStatus = (status) => String(status || 'processing').toLowerCase();

const toTime = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time) ? time : null;
};

const getFallbackReviewAvailableAt = (order, current) => {
  const createdAt = toTime(current?.createdAt || order?.createdAt) || Date.now();
  return new Date(createdAt + REVIEW_UNLOCK_DELAY_MS).toISOString();
};

export const getProductReviewKey = (product) => {
  if (!product) return 'unknown-product';
  return String(product.id ?? product.product_id ?? product.slug ?? product.name ?? 'unknown-product');
};

export const getOrderItemReviewKey = (item) => {
  const productKey = getProductReviewKey(item);
  return [productKey, item.size || 'standard', item.color || 'default'].join('|');
};

const normalizeOrderItem = (item) => ({
  id: item.id ?? item.product_id ?? null,
  product_id: item.product_id ?? item.id ?? null,
  slug: item.slug ?? null,
  name: item.name ?? item.product_name ?? 'Product',
  image: item.image ?? item.images?.[0] ?? null,
  price: Number(item.price || 0),
  quantity: Number(item.quantity || 1),
  size: item.size || 'Standard',
  color: item.color || null,
  reviewKey: getOrderItemReviewKey(item),
});

export const getPendingReviewOrders = () => readStorage(PENDING_REVIEW_ORDERS_KEY, []);

export const savePendingReviewOrder = (order) => {
  if (!order?.orderNumber || !Array.isArray(order.items) || order.items.length === 0) {
    return getPendingReviewOrders();
  }

  const existing = getPendingReviewOrders();
  const orderItems = order.items.map(normalizeOrderItem);
  const current = existing.find((item) => item.orderNumber === order.orderNumber);
  const status = normalizeStatus(current?.status || order.status || order.orderStatus);
  const shippedAt = current?.shippedAt || order.shippedAt || order.shipped_at || null;
  const deliveredAt = current?.deliveredAt || order.deliveredAt || order.delivered_at || null;
  const readyAt = current?.reviewAvailableAt
    || order.reviewAvailableAt
    || order.review_available_at
    || (REVIEW_READY_STATUSES.has(status)
      ? deliveredAt || shippedAt || new Date().toISOString()
      : getFallbackReviewAvailableAt(order, current));
  const savedOrder = {
    orderNumber: order.orderNumber,
    orderId: current?.orderId || order.orderId || order.id || null,
    total: order.total ?? 0,
    paymentMethod: order.paymentMethod ?? 'cod',
    shippingAddress: order.shippingAddress ?? null,
    status,
    shippedAt,
    deliveredAt,
    reviewAvailableAt: readyAt,
    createdAt: current?.createdAt || order.createdAt || new Date().toISOString(),
    items: current?.items?.length ? current.items : orderItems,
  };

  const next = [savedOrder, ...existing.filter((item) => item.orderNumber !== order.orderNumber)];
  writeStorage(PENDING_REVIEW_ORDERS_KEY, next);
  return next;
};

export const syncPendingReviewOrderStatuses = (remoteOrders = []) => {
  const remoteByNumber = new Map(
    remoteOrders
      .map((order) => [order.order_number || order.orderNumber, order])
      .filter(([orderNumber]) => orderNumber)
  );

  const next = getPendingReviewOrders().map((order) => {
    const remote = remoteByNumber.get(order.orderNumber);
    if (!remote) return order;

    const status = normalizeStatus(remote.status || order.status);
    const shippedAt = remote.shipped_at || (status === 'shipped' ? remote.updated_at : null) || order.shippedAt || null;
    const deliveredAt = remote.delivered_at || (status === 'delivered' ? remote.updated_at : null) || order.deliveredAt || null;
    const reviewAvailableAt = REVIEW_READY_STATUSES.has(status)
      ? deliveredAt || shippedAt || order.reviewAvailableAt || new Date().toISOString()
      : order.reviewAvailableAt;

    return {
      ...order,
      orderId: order.orderId || remote.id || null,
      status,
      shippedAt,
      deliveredAt,
      reviewAvailableAt,
    };
  });

  writeStorage(PENDING_REVIEW_ORDERS_KEY, next);
  return next;
};

export const getOrderReviewAvailableAt = (order) => (
  order?.reviewAvailableAt || order?.deliveredAt || order?.shippedAt || null
);

export const isOrderReviewReady = (order, now = Date.now()) => {
  if (!order) return false;
  if (REVIEW_READY_STATUSES.has(normalizeStatus(order.status))) return true;

  const availableAt = toTime(getOrderReviewAvailableAt(order));
  return availableAt !== null && availableAt <= now;
};

export const markOrderItemReviewed = (orderNumber, reviewKey) => {
  const next = getPendingReviewOrders()
    .map((order) => {
      if (order.orderNumber !== orderNumber) return order;
      return {
        ...order,
        items: order.items.filter((item) => item.reviewKey !== reviewKey),
      };
    })
    .filter((order) => order.items.length > 0);

  writeStorage(PENDING_REVIEW_ORDERS_KEY, next);
  return next;
};

export const getProductReviews = (product) => {
  const reviewsByProduct = readStorage(PRODUCT_REVIEWS_KEY, {});
  return reviewsByProduct[getProductReviewKey(product)] || [];
};

export const addProductReview = ({ product, item, orderNumber, rating, title, body, author }) => {
  const productKey = getProductReviewKey(product || item);
  const reviewsByProduct = readStorage(PRODUCT_REVIEWS_KEY, {});
  const review = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    productKey,
    productId: product?.id ?? item?.id ?? item?.product_id ?? null,
    productSlug: product?.slug ?? item?.slug ?? null,
    productName: product?.name ?? item?.name ?? 'Product',
    orderNumber,
    rating: Math.min(5, Math.max(1, Number(rating || 5))),
    title: title?.trim() || 'Verified review',
    body: body?.trim() || '',
    author: author?.trim() || 'Verified customer',
    createdAt: new Date().toISOString(),
    verified: true,
  };

  const next = {
    ...reviewsByProduct,
    [productKey]: [review, ...(reviewsByProduct[productKey] || [])],
  };
  writeStorage(PRODUCT_REVIEWS_KEY, next);
  return review;
};

export const getProductReviewSummary = (product) => {
  const localReviews = getProductReviews(product);
  const baseCount = Number(product?.reviewCount ?? product?.review_count ?? 0);
  const baseRating = Number(product?.rating ?? 0);
  const totalCount = baseCount + localReviews.length;
  const localTotal = localReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const baseTotal = baseRating * baseCount;
  const average = totalCount > 0 ? (baseTotal + localTotal) / totalCount : baseRating;

  return {
    average: Number(average.toFixed(1)),
    count: totalCount,
    localReviews,
  };
};
