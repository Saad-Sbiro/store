import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { formatPrice } from '../../utils/formatPrice';
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
import { Sheet, SheetContent, SheetTitle } from './Sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

export default function CartDrawer() {
  const { isOpen, setOpen, items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const toast = useToastStore((s) => s.toast);
  const navigate = useNavigate();
  const [clearOpen, setClearOpen] = useState(false);
  const total = totalPrice();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmClear = () => {
    clearCart();
    setClearOpen(false);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart.',
      variant: 'default',
    });
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
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="right" className="max-w-md">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-surface-200 px-6 pr-16">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-ink-600" />
              <SheetTitle className="text-card-title font-semibold text-ink-900">
                Your Cart
              </SheetTitle>
              {itemCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-brand-500 text-[11px] font-bold leading-none text-white">
                  {itemCount}
                </span>
              )}
            </div>

            {items.length > 0 && (
              <button
                onClick={() => setClearOpen(true)}
                className="text-[12px] font-medium text-ink-400 transition-colors hover:text-feedback-danger"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-surface-100">
                  <ShoppingBag size={28} className="text-ink-400" />
                </div>
                <div>
                  <p className="mb-1 font-semibold text-ink-900">Your cart is empty</p>
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
                {items.map((item, idx) => {
                  const image = item.image || item.images?.[0];

                  return (
                    <li
                      key={`${item.id}-${item.color}-${item.size}-${idx}`}
                      className="flex gap-4 border-b border-surface-200 py-4 last:border-0"
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-card bg-surface-100">
                        {image && (
                          <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-[11px] uppercase tracking-wider text-ink-400">
                          {typeof item.category === 'object' ? item.category?.name : item.category}
                        </p>
                        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900">
                          {item.name}
                        </p>
                        {item.size && (
                          <p className="mt-1 text-caption text-ink-400">
                            {item.size}
                            {item.color && (
                              <>
                                {' / '}
                                <span
                                  className="ml-1 inline-block h-3 w-3 rounded-pill border border-surface-200 align-middle"
                                  style={{ backgroundColor: item.color }}
                                />
                              </>
                            )}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden rounded-btn border border-surface-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="flex h-8 w-8 items-center justify-center text-ink-600 transition-colors hover:bg-surface-100"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-[14px] font-medium text-ink-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="flex h-8 w-8 items-center justify-center text-ink-600 transition-colors hover:bg-surface-100"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[15px] font-bold text-ink-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleRemoveItem(item.id, item.color, item.size, item.name)}
                                  aria-label={`Remove ${item.name} from cart`}
                                  className="flex h-8 w-8 items-center justify-center rounded-btn text-ink-400 transition-all duration-200 hover:bg-red-50 hover:text-feedback-danger"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Remove item</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="shrink-0 space-y-3 border-t border-surface-200 px-6 pb-6 pt-4">
              <div className="flex items-center justify-between">
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
                className="w-full py-2 text-center text-btn text-ink-400 transition-colors hover:text-ink-900"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

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
    </>
  );
}
