import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Clock3,
  MessageSquareText,
  Package,
  Send,
  Star,
  Truck,
} from 'lucide-react';

import { api } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { useToastStore } from '../store/useToastStore';
import {
  addProductReview,
  getOrderReviewAvailableAt,
  getPendingReviewOrders,
  isOrderReviewReady,
  markOrderItemReviewed,
  syncPendingReviewOrderStatuses,
} from '../utils/reviews';

const ease = [0.22, 1, 0.36, 1];

const formatUnlockDate = (value) => {
  if (!value) return 'after shipment';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'after shipment';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getAuthorName = (order) => (
  order?.shippingAddress?.fullName
  || order?.shippingAddress?.name
  || ''
);

const getFormKey = (orderNumber, reviewKey) => `${orderNumber}:${reviewKey}`;

function RatingInput({ value, onChange }) {
  return (
    <div className="flex justify-center gap-1.5" aria-label="Choose review rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          aria-label={`${rating} star review`}
          className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
            rating <= value ? 'text-amber-500' : 'text-ink-300 hover:text-amber-400'
          }`}
        >
          <Star size={20} fill={rating <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function ProductThumb({ item }) {
  if (item.image) {
    return (
      <img
        src={item.image}
        alt={item.name}
        className="h-14 w-14 shrink-0 rounded-btn bg-surface-100 object-cover"
      />
    );
  }

  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-btn bg-surface-100 text-ink-400">
      <Package size={18} />
    </div>
  );
}

export default function ReviewsPage() {
  const toast = useToastStore((s) => s.toast);
  const [orders, setOrders] = useState(() => getPendingReviewOrders());
  const [reviewForms, setReviewForms] = useState({});

  useEffect(() => {
    let cancelled = false;

    const syncOrderStatuses = async () => {
      try {
        const response = await api.getOrders();
        const remoteOrders = Array.isArray(response?.data)
          ? response.data
          : (Array.isArray(response) ? response : []);

        if (remoteOrders.length === 0) return;

        const nextOrders = syncPendingReviewOrderStatuses(remoteOrders);
        if (!cancelled) setOrders(nextOrders);
      } catch (error) {
        console.warn('Could not sync review order statuses:', error.message);
      }
    };

    syncOrderStatuses();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);
    const readyItems = orders.reduce(
      (sum, order) => sum + (isOrderReviewReady(order) ? order.items.length : 0),
      0
    );

    return {
      totalItems,
      readyItems,
      waitingItems: totalItems - readyItems,
    };
  }, [orders]);

  const getReviewForm = (order, item) => {
    const key = getFormKey(order.orderNumber, item.reviewKey);
    return reviewForms[key] || {
      rating: 5,
      title: '',
      body: '',
      author: getAuthorName(order),
    };
  };

  const updateReviewForm = (order, item, patch) => {
    const key = getFormKey(order.orderNumber, item.reviewKey);
    setReviewForms((current) => ({
      ...current,
      [key]: {
        ...getReviewForm(order, item),
        ...patch,
      },
    }));
  };

  const submitReview = (order, item) => {
    if (!isOrderReviewReady(order)) {
      toast({
        title: 'Review unlocks after shipment',
        description: 'Come back from My Reviews once the order has shipped.',
        variant: 'warning',
      });
      return;
    }

    const form = getReviewForm(order, item);
    if (form.body.trim().length < 8) {
      toast({
        title: 'Review text required',
        description: 'Write a little more about the product before submitting.',
        variant: 'warning',
      });
      return;
    }

    addProductReview({
      item,
      orderNumber: order.orderNumber,
      rating: form.rating,
      title: form.title,
      body: form.body,
      author: form.author || getAuthorName(order),
    });

    const nextOrders = markOrderItemReviewed(order.orderNumber, item.reviewKey);
    setOrders(nextOrders);
    setReviewForms((current) => {
      const next = { ...current };
      delete next[getFormKey(order.orderNumber, item.reviewKey)];
      return next;
    });

    toast({
      title: 'Review added',
      description: `${item.name} is now published as a verified review.`,
      variant: 'success',
    });
  };

  // Block access until the user has placed at least one order
  if (orders.length === 0) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-surface-50" style={{ paddingTop: '108px', paddingBottom: '72px' }}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease }}
          className="mb-8"
        >
          <p className="text-caption font-semibold uppercase tracking-wide text-brand-500">My Reviews</p>
          <h1 className="mt-2 font-hero text-section-sm font-bold text-ink-900 md:text-section">Product reviews</h1>
          <p className="mt-2 max-w-2xl text-body text-ink-400">
            Review forms appear here after your order ships, so feedback comes from the real product experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
          className="mb-6 grid gap-3 sm:grid-cols-3"
        >
          {[
            { label: 'Ready', value: stats.readyItems, icon: CheckCircle },
            { label: 'Waiting', value: stats.waitingItems, icon: Clock3 },
            { label: 'Total', value: stats.totalItems, icon: MessageSquareText },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-panel border border-surface-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-400">{label}</p>
                <Icon size={16} className="text-ink-400" />
              </div>
              <p className="mt-2 font-hero text-[28px] font-bold leading-none text-ink-900">{value}</p>
            </div>
          ))}
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.5, ease }}
            className="rounded-panel border border-surface-200 bg-white p-8 text-center"
          >
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-btn bg-surface-100 text-ink-400">
              <MessageSquareText size={22} />
            </div>
            <h2 className="font-hero text-card-title font-bold text-ink-900">No products waiting for review</h2>
            <p className="mx-auto mt-2 max-w-md text-caption leading-relaxed text-ink-400">
              After you place an order, this page will hold the review form until the shipment is ready.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-ink-900 px-5 text-caption font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ink-600"
            >
              Shop products <ArrowRight size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, index) => {
              const ready = isOrderReviewReady(order);
              const unlockDate = getOrderReviewAvailableAt(order);

              return (
                <motion.article
                  key={order.orderNumber}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.5, ease }}
                  className="overflow-hidden rounded-panel border border-surface-200 bg-white"
                >
                  <div className="flex flex-col gap-4 border-b border-surface-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-caption text-ink-400">Order code</p>
                      <h2 className="font-hero text-card-title font-bold text-ink-900">{order.orderNumber}</h2>
                      <p className="mt-1 text-caption text-ink-400">
                        {order.items.length} {order.items.length === 1 ? 'product' : 'products'} waiting for review
                      </p>
                    </div>

                    <div
                      className={`inline-flex h-9 items-center gap-2 self-start rounded-btn px-3 text-caption font-semibold ${
                        ready
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ready ? <CheckCircle size={15} /> : <Truck size={15} />}
                      {ready ? 'Ready to review' : `Unlocks ${formatUnlockDate(unlockDate)}`}
                    </div>
                  </div>

                  <div className="divide-y divide-surface-200">
                    {order.items.map((item) => {
                      const form = getReviewForm(order, item);

                      return (
                        <div key={item.reviewKey} className="p-5">
                          <div className="flex gap-4">
                            <ProductThumb item={item} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-semibold text-ink-900">{item.name}</p>
                              <p className="mt-0.5 text-caption text-ink-400">
                                Qty {item.quantity}
                                {item.size ? ` - ${item.size}` : ''}
                                {item.price ? ` - ${formatPrice(item.price * item.quantity)}` : ''}
                              </p>
                            </div>
                          </div>

                          {ready ? (
                            <div className="mt-4 grid gap-3">
                              <RatingInput
                                value={form.rating}
                                onChange={(rating) => updateReviewForm(order, item, { rating })}
                              />

                              <textarea
                                value={form.body}
                                onChange={(event) => updateReviewForm(order, item, { body: event.target.value })}
                                rows={4}
                                className="input-field resize-none text-[13px]"
                                placeholder="Write your review after using the product"
                              />
                              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <input
                                  value={form.author}
                                  onChange={(event) => updateReviewForm(order, item, { author: event.target.value })}
                                  className="input-field !py-2.5 text-[13px]"
                                  placeholder="Your name"
                                />
                                <button
                                  type="button"
                                  onClick={() => submitReview(order, item)}
                                  className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-ink-900 px-5 text-caption font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ink-600"
                                >
                                  Submit <Send size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 rounded-btn bg-surface-50 px-4 py-3 text-caption leading-relaxed text-ink-400">
                              This form unlocks after shipment, so the customer can review the product with the real delivery experience in mind.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
