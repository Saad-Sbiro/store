import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  LoaderCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';

import { api } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { formatPrice } from '../utils/formatPrice';

const CHECKOUT_LEAD_TOKEN_KEY = 'cutportal_checkout_lead_token';
const MOROCCAN_PHONE_PATTERN = /^(0[5-7]\d{8}|\+212[5-7]\d{8})$/;

const createFallbackOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `VS-${date}-${String(now.getTime()).slice(-4)}`;
};

const createCheckoutToken = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();

  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const getCheckoutToken = () => {
  const existing = sessionStorage.getItem(CHECKOUT_LEAD_TOKEN_KEY);
  if (existing) return existing;

  const token = createCheckoutToken();
  sessionStorage.setItem(CHECKOUT_LEAD_TOKEN_KEY, token);
  return token;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore();
  const toast = useToastStore((state) => state.toast);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dbProducts, setDbProducts] = useState([]);
  const [leadToken] = useState(getCheckoutToken);
  const latestLeadPayloadRef = useRef(null);
  const orderSubmittedRef = useRef(false);
  const abandonmentSentRef = useRef(false);
  const paymentMethod = 'cod';

  useEffect(() => {
    api.getProducts({ per_page: 100 })
      .then((response) => setDbProducts(response?.data || response || []))
      .catch((error) => console.error('Product pricing load failed:', error));
  }, []);

  const subtotal = totalPrice();
  const shipping = 0;
  const hasProductPromo = items.some((item) => {
    const product = dbProducts.find((candidate) => candidate.id === item.id) || item;
    return product.tags?.some((tag) => /^promo:[^:]+:\d+$/i.test(tag));
  });
  let discount = 0;

  if (promoApplied && appliedPromo) {
    items.forEach((item) => {
      const dbProduct = dbProducts.find(product => product.id === item.id) || item;
      const promoTag = dbProduct.tags?.find(tag => tag.toLowerCase().startsWith(`promo:${appliedPromo.toLowerCase()}:`));
      if (promoTag) {
        const percentage = parseInt(promoTag.split(':')[2]) || 0;
        discount += Math.round(item.price * item.quantity * (percentage / 100));
      }
    });
  }

  const total = Math.max(0, subtotal - discount + shipping);
  const normalizedPhone = form.phone.replace(/\s/g, '');
  const canSaveCheckoutLead = MOROCCAN_PHONE_PATTERN.test(normalizedPhone)
    && items.length > 0;

  const latestLeadPayload = useMemo(() => (
    canSaveCheckoutLead ? {
      token: leadToken,
      full_name: form.fullName.trim() || null,
      phone: normalizedPhone,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      })),
    } : null
  ), [canSaveCheckoutLead, form, items, leadToken, normalizedPhone]);

  useEffect(() => {
    latestLeadPayloadRef.current = latestLeadPayload;
    if (!latestLeadPayload) return undefined;

    const timeout = window.setTimeout(() => {
      if (orderSubmittedRef.current) return;

      api.saveCheckoutLead({ ...latestLeadPayload, abandoned: false })
        .catch(error => console.warn('Checkout recovery save failed:', error.message));
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [latestLeadPayload]);

  useEffect(() => {
    const markAbandoned = () => {
      const payload = latestLeadPayloadRef.current;
      if (!payload || orderSubmittedRef.current || abandonmentSentRef.current) return;

      abandonmentSentRef.current = true;
      api.saveCheckoutLead(
        { ...payload, abandoned: true },
        { keepalive: true },
      ).catch(error => console.warn('Checkout abandonment save failed:', error.message));
    };

    let settled = false;
    const settleTimer = window.setTimeout(() => {
      settled = true;
    }, 0);
    window.addEventListener('pagehide', markAbandoned);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('pagehide', markAbandoned);
      if (settled) markAbandoned();
    };
  }, []);

  const setField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors(current => ({ ...current, [field]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'أدخل الاسم الكامل';
    if (!form.phone.trim()) nextErrors.phone = 'أدخل رقم الهاتف';
    else if (!MOROCCAN_PHONE_PATTERN.test(normalizedPhone)) nextErrors.phone = 'رقم الهاتف غير صحيح';
    if (!form.address.trim()) nextErrors.address = 'أدخل عنوان التوصيل';
    if (!form.city.trim()) nextErrors.city = 'أدخل المدينة';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const matched = items.some((item) => {
      const dbProduct = dbProducts.find(product => product.id === item.id) || item;
      return dbProduct.tags?.some(tag => tag.toLowerCase().startsWith(`promo:${code.toLowerCase()}:`));
    });

    if (matched) {
      setAppliedPromo(code);
      setPromoApplied(true);
      toast({ title: 'تم تطبيق التخفيض', description: `تم قبول الكود ${code}.`, variant: 'success' });
    } else {
      toast({ title: 'الكود غير صالح', description: 'هذا الكود لا ينطبق على منتجات السلة.', variant: 'warning' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!validate() || items.length === 0) return;
    setLoading(true);

    try {
      orderSubmittedRef.current = true;

      const leadPayload = latestLeadPayloadRef.current;
      if (leadPayload) {
        await api.saveCheckoutLead({ ...leadPayload, abandoned: false })
          .catch(error => console.warn('Final checkout recovery save failed:', error.message));
      }

      const orderData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size || 'Standard',
          color: item.color || null,
        })),
        shipping_address: {
          name: form.fullName,
          phone: normalizedPhone,
          street: form.address,
          city: form.city,
          state: form.city,
          country: 'MA',
        },
        payment_method: 'Cash on Delivery',
        discount_amount: discount,
        shipping_cost: shipping,
        checkout_token: leadToken,
      };

      const result = await api.createOrder(orderData);
      sessionStorage.removeItem(CHECKOUT_LEAD_TOKEN_KEY);
      api.logEvent('purchase', '/checkout', null, { total })
        .catch(error => console.warn('Purchase analytics failed:', error.message));

      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderNumber: result?.order?.order_number || result?.order_number || createFallbackOrderNumber(),
          orderId: result?.order?.id || result?.id || null,
          orderStatus: result?.order?.status || result?.status || 'pending',
          createdAt: result?.order?.created_at || new Date().toISOString(),
          total: Number(result?.order?.total ?? total),
          items,
          shippingAddress: form,
          paymentMethod,
        },
      });
    } catch (error) {
      orderSubmittedRef.current = false;
      console.error(error);
      toast({
        title: 'تعذر تأكيد الطلب',
        description: error.message || 'حاول مرة أخرى.',
        variant: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-surface-50 px-5 pt-24 font-arabic"
        dir="rtl"
      >
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-white text-ink-500 shadow-sm">
            <ShoppingBag size={27} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">سلة التسوق فارغة</h1>
          <p className="mt-2 text-[14px] leading-7 text-ink-500">
            أضف المنتج الذي تريده ثم عد لإتمام الطلب.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-ink-900 px-6 text-[14px] font-bold text-white"
          >
            تصفح المنتجات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-surface-50 pb-16 pt-[92px] font-arabic text-ink-900 sm:pt-[108px]"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex h-12 items-center gap-2 text-[13px] font-semibold text-ink-500"
        >
          <ArrowRight size={16} />
          متابعة التسوق
        </Link>

        <h1 className="mb-6 mt-1 text-[28px] font-bold leading-tight sm:text-[34px]">
          تأكيد الطلب
        </h1>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
          <section className="rounded-lg border border-surface-200 bg-white p-4 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-900 text-white">
                <Truck size={18} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold">معلومات التوصيل</h2>
                <p className="mt-0.5 text-[12px] text-ink-400">أدخل معلومات صحيحة لتأكيد الطلب بسرعة.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="checkout-name" className="mb-1.5 block text-[13px] font-semibold text-ink-600">
                  الاسم الكامل
                </label>
                <input
                  id="checkout-name"
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  autoComplete="name"
                  className="input-field min-h-[50px] !rounded-lg !text-[16px]"
                  placeholder="مثال: محمد العلوي"
                />
                {errors.fullName && <p className="mt-1 text-[12px] text-feedback-danger">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="checkout-phone" className="mb-1.5 block text-[13px] font-semibold text-ink-600">
                  رقم الهاتف
                </label>
                <input
                  id="checkout-phone"
                  value={form.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  className="input-field min-h-[50px] !rounded-lg !text-right !text-[16px]"
                  placeholder="06 12 34 56 78"
                />
                {errors.phone && <p className="mt-1 text-[12px] text-feedback-danger">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="checkout-address" className="mb-1.5 block text-[13px] font-semibold text-ink-600">
                  عنوان التوصيل
                </label>
                <input
                  id="checkout-address"
                  value={form.address}
                  onChange={(event) => setField('address', event.target.value)}
                  autoComplete="street-address"
                  className="input-field min-h-[50px] !rounded-lg !text-[16px]"
                  placeholder="الحي، الشارع ورقم المنزل"
                />
                {errors.address && <p className="mt-1 text-[12px] text-feedback-danger">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="checkout-city" className="mb-1.5 block text-[13px] font-semibold text-ink-600">
                  المدينة
                </label>
                <input
                  id="checkout-city"
                  value={form.city}
                  onChange={(event) => setField('city', event.target.value)}
                  autoComplete="address-level2"
                  className="input-field min-h-[50px] !rounded-lg !text-[16px]"
                  placeholder="مثال: الدار البيضاء"
                />
                {errors.city && <p className="mt-1 text-[12px] text-feedback-danger">{errors.city}</p>}
              </div>

              <div className="flex items-center gap-3 border-y border-surface-200 py-4">
                <Banknote size={20} className="shrink-0 text-ink-700" />
                <div>
                  <p className="text-[13px] font-bold">الدفع عند الاستلام</p>
                  <p className="mt-0.5 text-[11px] text-ink-400">لن تدفع أي مبلغ قبل وصول الطلب.</p>
                </div>
              </div>

            </div>
          </section>

          <section className="rounded-lg border border-surface-200 bg-white p-4 sm:p-5 lg:sticky lg:top-28">
            <h2 className="text-[17px] font-bold">ملخص الطلب</h2>

            <div className="mt-4 max-h-[340px] divide-y divide-surface-200 overflow-y-auto">
              {items.map((item) => (
                <article key={`${item.id}-${item.color}-${item.size}`} className="flex gap-3 py-4 first:pt-0">
                  <img
                    src={item.image || item.images?.[0]}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg bg-surface-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-bold">{item.name}</h3>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-400">
                          {item.size && <span>{item.size}</span>}
                          {item.color && (
                            <span
                              className="h-3 w-3 rounded-full border border-surface-300"
                              style={{ backgroundColor: item.color }}
                              aria-label="لون المنتج"
                            />
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.color, item.size)}
                        aria-label={`حذف ${item.name}`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-feedback-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[13px] font-bold">{formatPrice(item.price * item.quantity)}</p>
                      <div className="inline-flex h-8 items-center overflow-hidden rounded-lg border border-surface-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))}
                          aria-label="تقليل الكمية"
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center text-[12px] font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                          aria-label="زيادة الكمية"
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {hasProductPromo && (
              <div className="border-t border-surface-200 pt-4">
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value)}
                      disabled={promoApplied}
                      className="input-field min-h-11 !rounded-lg !py-2 !pr-9 text-[13px]"
                      placeholder="كود التخفيض"
                      dir="ltr"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()}
                    className="h-11 shrink-0 rounded-lg bg-ink-900 px-4 text-[12px] font-bold text-white disabled:opacity-40"
                  >
                    {promoApplied ? 'تم' : 'تطبيق'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2 border-t border-surface-200 pt-4 text-[13px]">
              <div className="flex justify-between text-ink-600">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>التخفيض</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-600">
                <span>التوصيل</span>
                <span className="font-semibold text-emerald-600">
                  {shipping === 0 ? 'مجاني' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-surface-200 pt-3 text-[17px] font-extrabold">
                <span>الإجمالي</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-[14px] font-bold text-white transition-colors hover:bg-ink-600 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  جاري تأكيد الطلب
                </>
              ) : (
                <>
                  <ShoppingBag size={17} />
                  تأكيد الطلب
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-ink-400">
              <ShieldCheck size={14} />
              <span>معلوماتك محمية وتستخدم لتجهيز الطلب فقط</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
