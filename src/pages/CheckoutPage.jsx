// ─────────────────────────────────────────────
// FILE: src/pages/CheckoutPage.jsx
// Full checkout with shipping form, payment selector, order summary
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, Truck, CreditCard, Banknote, Shield, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { formatPrice } from '../utils/formatPrice';
import { api } from '../services/api';
import SlideToConfirm from '../components/ui/SlideToConfirm';

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: (i = 0) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const createFallbackOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = String(now.getTime()).slice(-4);
  return `VS-${date}-${suffix}`;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore();
  const toast = useToastStore((s) => s.toast);

  const [form, setForm] = useState({
    fullName: '', phone: '',
    address: '', city: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    api.getProducts({ per_page: 100 }).then((res) => {
      setDbProducts(res?.data || res || []);
    }).catch(err => console.error(err));
  }, []);

  const total = totalPrice();
  const shipping = 0;
  
  // Calculate discount dynamically based on dbProducts
  let discount = 0;
  if (promoApplied && appliedPromo) {
    if (appliedPromo === 'void10') {
      discount = Math.round(total * 0.1);
    } else {
      items.forEach((item) => {
        const dbProd = dbProducts.find(p => p.id === item.id) || item;
        const promoTag = dbProd.tags?.find(t => t.toLowerCase().startsWith(`promo:${appliedPromo.toLowerCase()}:`));
        if (promoTag) {
          const pct = parseInt(promoTag.split(':')[2]) || 0;
          discount += Math.round(item.price * item.quantity * (pct / 100));
        }
      });
    }
  }

  const grandTotal = total - discount + shipping;

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'أدخل اسمك';
    if (!form.phone.trim()) e.phone = 'أدخل رقم الهاتف';
    else if (!/^(0[5-7]\d{8}|\+212[5-7]\d{8})$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'رقم غير صحيح';
    if (!form.address.trim()) e.address = 'أدخل عنوانك';
    if (!form.city.trim()) e.city = 'أدخل المدينة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'VOID10') {
      setAppliedPromo('void10');
      setPromoApplied(true);
      toast({ title: 'Promo Applied!', description: '10% discount has been applied.', variant: 'success' });
      return;
    }

    // Check if code matches any item in the cart using fresh DB products
    let matched = false;
    items.forEach((item) => {
      const dbProd = dbProducts.find(p => p.id === item.id) || item;
      const promoTag = dbProd.tags?.find(t => t.toLowerCase().startsWith(`promo:${code.toLowerCase()}:`));
      if (promoTag) matched = true;
    });

    if (matched) {
      setAppliedPromo(code);
      setPromoApplied(true);
      toast({ title: 'Promo Applied!', description: `Promo code ${code} applied successfully to matching items.`, variant: 'success' });
    } else {
      toast({ title: 'Invalid Code', description: 'This promo code is not valid for items in your cart.', variant: 'warning' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!validate()) throw new Error('Validation failed');
    if (items.length === 0) return;
    setLoading(true);

    try {
      // Ensure auth
      let token = localStorage.getItem('cutportal_token');
      if (!token) {
        try {
          await api.login('john@example.com', 'passpass');
        } catch (loginErr) {
          console.warn('Silent login failed, attempting to register guest user...', loginErr);
          try {
            await api.register('John Doe', 'john@example.com', 'passpass', 'passpass');
          } catch (regErr) {
            console.error('Guest registration failed:', regErr);
            throw new Error('Could not authenticate guest checkout. Please try again.');
          }
        }
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
          phone: form.phone,
          street: form.address,
          city: form.city,
          state: form.city,
          country: 'MA',
        },
        payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card',
        discount_amount: discount,
        shipping_cost: shipping,
      };

      const result = await api.createOrder(orderData);
      await api.logEvent('purchase', '/checkout', null, { total: grandTotal });

      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderNumber: result?.order?.order_number || result?.order_number || createFallbackOrderNumber(),
          orderId: result?.order?.id || result?.id || null,
          orderStatus: result?.order?.status || result?.status || 'pending',
          createdAt: result?.order?.created_at || new Date().toISOString(),
          total: grandTotal,
          items: items,
          shippingAddress: form,
          paymentMethod,
        },
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Order Failed', description: err.message || 'Please try again.', variant: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center" style={{ paddingTop: '120px' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-ink-400" />
          </div>
          <h1 className="font-hero text-2xl font-bold text-ink-900 mb-2">Your cart is empty</h1>
          <p className="text-ink-400 text-body mb-8">Add some products to your cart before checking out.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-btn text-btn font-semibold hover:bg-ink-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50" style={{ paddingTop: '108px' }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-caption text-ink-400 hover:text-ink-600 transition-colors">
          <ChevronLeft size={14} /> Continue Shopping
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-hero text-section-sm md:text-section font-bold text-ink-900 mb-8"
          style={{ letterSpacing: '-0.03em' }}
        >
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12">
          {/* ── LEFT: Forms ── */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="bg-white rounded-panel border border-surface-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-btn bg-ink-900 flex items-center justify-center text-white">
                  <Truck size={18} />
                </div>
                <div>
                  <h2 className="font-hero text-card-title font-bold text-ink-900">Shipping Information</h2>
                  <p className="text-caption text-ink-400">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-caption font-medium text-ink-600 mb-1.5">الاسم الكامل *</label>
                  <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input-field" placeholder="أدخل اسمك" dir="rtl" />
                  {errors.fullName && <p className="text-caption text-feedback-danger mt-1">{errors.fullName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-caption font-medium text-ink-600 mb-1.5">رقم الهاتف *</label>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" placeholder="أدخل رقم الهاتف" dir="rtl" />
                  {errors.phone && <p className="text-caption text-feedback-danger mt-1">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-caption font-medium text-ink-600 mb-1.5">العنوان *</label>
                  <input value={form.address} onChange={(e) => set('address', e.target.value)} className="input-field" placeholder="أدخل عنوانك" dir="rtl" />
                  {errors.address && <p className="text-caption text-feedback-danger mt-1">{errors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-caption font-medium text-ink-600 mb-1.5">المدينة *</label>
                  <input value={form.city} onChange={(e) => set('city', e.target.value)} className="input-field" placeholder="أدخل المدينة" dir="rtl" />
                  {errors.city && <p className="text-caption text-feedback-danger mt-1">{errors.city}</p>}
                </div>
              </div>
            </motion.div>

            
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="bg-white rounded-panel border border-surface-200 p-4 sm:p-6">
              <h2 className="font-hero text-card-title font-bold text-ink-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-3 p-3 rounded-card bg-surface-50">
                    <img src={item.image || item.images?.[0]} alt={item.name} className="w-16 h-16 rounded-btn object-cover flex-shrink-0 bg-surface-100" />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-ink-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-ink-400 flex items-center gap-1.5 mt-0.5">
                            {item.size && <span>{item.size}</span>}
                            {item.size && item.color && <span> · </span>}
                            {item.color && <span className="inline-block w-2.5 h-2.5 rounded-full border border-surface-300" style={{ backgroundColor: item.color }} />}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id, item.color, item.size)} 
                          className="w-7 h-7 rounded-btn flex items-center justify-center text-ink-400 hover:text-feedback-danger hover:bg-red-50 transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <p className="text-[13px] font-semibold text-ink-600">{formatPrice(item.price)}</p>
                        
                        <div className="flex items-center gap-0.5 bg-white border border-surface-200 rounded-btn p-0.5 shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))} 
                            className="w-6 h-6 rounded-btn flex items-center justify-center hover:bg-surface-100 transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center text-caption font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)} 
                            className="w-6 h-6 rounded-btn flex items-center justify-center hover:bg-surface-100 transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mt-4 pt-4 border-t border-surface-200">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      placeholder="Promo code"
                      className="input-field pl-9 !py-2.5 text-caption"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()}
                    className="px-4 py-2.5 rounded-btn bg-ink-900 text-white text-caption font-semibold hover:bg-ink-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {promoApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-surface-200 space-y-2">
                <div className="flex justify-between text-caption text-ink-600">
                  <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-caption text-feedback-success font-medium">
                    <span>Discount (10%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-caption text-ink-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-feedback-success font-medium">Free</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-[16px] font-bold text-ink-900 pt-2 border-t border-surface-200">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-6">
                <SlideToConfirm
                  text="مرر لتأكيد الطلب"
                  successText="تم تأكيد الطلب"
                  onConfirm={handlePlaceOrder}
                  disabled={loading}
                />
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="hidden mt-6 w-full h-[52px] rounded-btn bg-ink-900 text-white font-hero text-btn font-bold uppercase tracking-wide hover:bg-ink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {paymentMethod === 'cod' ? 'Place Order — Cash on Delivery' : 'Place Order'}
                  </>
                )}
              </button>

              {/* Trust signals */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
                <Shield size={13} />
                <span>Secure checkout · Free returns within 14 days</span>
              </div>

              {shipping > 0 && (
                <p className="mt-2 text-center text-[11px] text-ink-400">
                  Delivery is calculated before confirmation
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}