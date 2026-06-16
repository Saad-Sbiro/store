// ─────────────────────────────────────────────
// FILE: src/components/ui/CartDrawer.jsx
// ─────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { formatPrice } from '../../utils/formatPrice';
import { api } from '../../services/api';
import Button from './Button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancelButton,
  AlertDialogConfirmAction,
} from './AlertDialog';

export default function CartDrawer() {
  const { isOpen, setOpen, items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const toast = useToastStore((s) => s.toast);
  const navigate = useNavigate();

  const [clearOpen, setClearOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const total = totalPrice();

  const handleConfirmClear = () => {
    clearCart();
    setClearOpen(false);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart.',
      variant: 'default',
    });
  };

  const handleConfirmCheckout = async () => {
    try {
      // 1. Ensure user is authenticated (auto-login default user if not logged in)
      let token = localStorage.getItem('voidstore_token');
      if (!token) {
        await api.login('john@example.com', 'password123');
      }

      // 2. Build items array for API
      const apiItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        size: item.size || 'Standard',
        color: item.color || null
      }));

      // 3. Place order in database via API
      const orderData = {
        items: apiItems,
        shipping_address: {
          name: 'John Doe',
          street: '123 Workspace Ave',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94107',
          country: 'US'
        },
        payment_method: 'Stripe'
      };

      await api.createOrder(orderData);

      // 4. Log purchase analytics event
      await api.logEvent('purchase', window.location.pathname, null, { total });

      clearCart();
      setCheckoutOpen(false);
      setOpen(false);
      toast({
        title: 'Order Placed!',
        description: 'Thank you for shopping. Your order has been successfully saved to the database.',
        variant: 'success',
        duration: 5000,
      });

    } catch (err) {
      console.error(err);
      toast({
        title: 'Checkout Failed',
        description: err.message || 'Unable to place order. Please try again.',
        variant: 'warning',
      });
    }
  };

  const handleRemoveItem = (id, color, size, name) => {
    removeItem(id, color, size);
    toast({
      title: 'Item Removed',
      description: `${name} has been removed from your cart.`,
      variant: 'default',
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              key="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-white flex flex-col shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-surface-200 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-ink-600" />
                  <h2 className="text-card-title font-semibold text-ink-900">
                    Your Cart
                  </h2>
                  {items.length > 0 && (
                    <span className="w-5 h-5 rounded-pill bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {items.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <button
                      onClick={() => setClearOpen(true)}
                      className="text-[12px] font-medium text-ink-400 hover:text-feedback-danger transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    id="cart-drawer-close"
                    onClick={() => setOpen(false)}
                    aria-label="Close cart"
                    className="w-9 h-9 flex items-center justify-center rounded-btn text-ink-400 hover:text-ink-900 hover:bg-surface-100 transition-all duration-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto py-4 px-6 scrollbar-thin">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                    <div className="w-16 h-16 rounded-pill bg-surface-100 flex items-center justify-center">
                      <ShoppingBag size={28} className="text-ink-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 mb-1">Your cart is empty</p>
                      <p className="text-caption text-ink-400">Add something beautiful to get started.</p>
                    </div>
                    <Button
                      id="cart-empty-shop"
                      variant="primary"
                      size="md"
                      onClick={() => setOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {items.map((item, idx) => (
                      <li
                        key={`${item.id}-${item.color}-${item.size}-${idx}`}
                        className="flex gap-4 py-4 border-b border-surface-200 last:border-0"
                      >
                        <div className="w-20 h-24 rounded-card overflow-hidden bg-surface-100 shrink-0">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-ink-400 mb-0.5">
                            {item.category}
                          </p>
                          <p className="text-[15px] font-semibold text-ink-900 line-clamp-2 leading-snug">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="text-caption text-ink-400 mt-1">
                              {item.size}
                              {item.color && (
                                <>
                                  {' · '}
                                  <span
                                    className="inline-block w-3 h-3 rounded-pill border border-surface-200 align-middle ml-1"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </>
                              )}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity */}
                            <div className="flex items-center gap-2 border border-surface-200 rounded-btn overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="w-8 h-8 flex items-center justify-center text-ink-600 hover:bg-surface-100 transition-colors"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-6 text-center text-[14px] font-medium text-ink-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-8 h-8 flex items-center justify-center text-ink-600 hover:bg-surface-100 transition-colors"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Price + Remove */}
                            <div className="flex items-center gap-3">
                              <span className="text-[15px] font-bold text-ink-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => handleRemoveItem(item.id, item.color, item.size, item.name)}
                                aria-label={`Remove ${item.name} from cart`}
                                className="w-8 h-8 flex items-center justify-center rounded-btn text-ink-400 hover:text-feedback-danger hover:bg-red-50 transition-all duration-200"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="px-6 pb-6 pt-4 border-t border-surface-200 space-y-3 shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-body text-ink-600">Subtotal</span>
                    <span className="text-[20px] font-bold text-ink-900">{formatPrice(total)}</span>
                  </div>
                  <p className="text-caption text-ink-400">
                    Shipping & taxes calculated at checkout
                  </p>
                  <Button
                    id="cart-checkout"
                    variant="primary"
                    size="xl"
                    fullWidth
                    onClick={() => { setOpen(false); navigate('/checkout'); }}
                    className="mt-2"
                  >
                    Checkout - {formatPrice(total)}
                  </Button>
                  <button
                    id="cart-continue-shopping"
                    onClick={() => setOpen(false)}
                    className="w-full text-center text-btn text-ink-400 hover:text-ink-900 py-2 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── AlertDialogs ── */}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent from="bottom">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Shopping Cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancelButton>Cancel</AlertDialogCancelButton>
            <AlertDialogConfirmAction onClick={handleConfirmClear} intent="danger">
              Clear Cart
            </AlertDialogConfirmAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <AlertDialogContent from="bottom">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              This will place a simulated order for {formatPrice(total)}. No real payment will be charged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancelButton>Cancel</AlertDialogCancelButton>
            <AlertDialogConfirmAction onClick={handleConfirmCheckout} intent="default">
              Confirm & Pay
            </AlertDialogConfirmAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
