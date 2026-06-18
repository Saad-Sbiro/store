// ─────────────────────────────────────────────
// FILE: src/pages/OrderConfirmationPage.jsx
// Post-checkout success page with once-only auto-downloading PDF receipt
// ─────────────────────────────────────────────

import { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Copy, Download, MessageSquareText } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { useToastStore } from '../store/useToastStore';
import { savePendingReviewOrder } from '../utils/reviews';

const ease = [0.22, 1, 0.36, 1];

// Dynamically load jsPDF CDN script
const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => {
      if (window.jspdf) {
        resolve(window.jspdf);
      } else {
        reject(new Error('jsPDF failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('jsPDF script failed to load'));
    document.body.appendChild(script);
  });
};

export default function OrderConfirmationPage() {
  const location = useLocation();
  const toast = useToastStore((s) => s.toast);
  const state = location.state;
  const hasOrder = Boolean(state?.orderNumber);
  const downloadInitiated = useRef(false);

  const { orderNumber, orderId, orderStatus, createdAt, total, items = [], shippingAddress, paymentMethod } = state || {};

  const downloadReceiptPDF = useCallback(async (showNotification = false) => {
    try {
      const jspdfModule = await loadJsPDF();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF();

      // Premium Styling
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 15, 'F');

      // Title/Logo
      const img = await loadImage(logoImg);
      if (img) {
        doc.addImage(img, 'PNG', 20, 22.5, 8.5, 8.5);
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(10, 10, 10);
      doc.text('UT PORTAL', 29.5, 29.5);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('Premium Workspace Essentials', 20, 38);

      // Line Separator
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(20, 44, 190, 44);

      // Order Info Column
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      doc.text('ORDER DETAILS', 20, 54);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`Order Code: ${orderNumber}`, 20, 62);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-MA')}`, 20, 68);
      doc.text(`Payment: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}`, 20, 74);

      // Shipping Column
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      doc.text('SHIPPING ADDRESS', 110, 54);

      // Render shipping address lines to an offscreen canvas to support Arabic/Unicode text
      const addressLines = [
        shippingAddress?.fullName || '',
        shippingAddress?.phone || '',
        shippingAddress?.address || '',
        shippingAddress?.city || ''
      ].filter(Boolean);

      const addressImg = renderTextToImage(addressLines, {
        fontSize: 13,
        lineHeight: 22,
        width: 400,
        height: 110,
        textColor: '#3c3c3c',
        align: 'left'
      });

      doc.addImage(addressImg, 'PNG', 110, 58, 80, 22);

      // Table Line
      doc.line(20, 88, 190, 88);

      // Items Table Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text('Product Name', 20, 96);
      doc.text('Qty', 130, 96, { align: 'center' });
      doc.text('Price', 170, 96, { align: 'right' });

      doc.line(20, 100, 190, 100);

      // Items Table Rows
      let y = 108;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);

      items?.forEach((item) => {
        // Handle name wrapping if it is too long
        const cleanName = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name;
        doc.text(cleanName, 20, y);
        doc.text(String(item.quantity), 130, y, { align: 'center' });
        doc.text(formatPrice(item.price * item.quantity), 170, y, { align: 'right' });
        y += 8;
      });

      doc.line(20, y, 190, y);
      y += 10;

      // Totals
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      doc.text('Total Paid:', 110, y);
      doc.text(formatPrice(total), 170, y, { align: 'right' });

      y += 16;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Estimated delivery: from 24 to 48 hours', 105, y, { align: 'center' });

      doc.save(`Receipt-${orderNumber}.pdf`);

      if (showNotification) {
        toast({ title: 'Receipt Downloaded', description: 'Your PDF receipt has been saved.', variant: 'success' });
      }
    } catch (e) {
      console.error('Failed to generate receipt PDF:', e);
      toast({ title: 'Download Failed', description: 'Could not generate receipt PDF.', variant: 'warning' });
    }
  }, [items, orderNumber, paymentMethod, shippingAddress, toast, total]);

  // Auto-download receipt only for a fresh checkout, not for restored pending reviews.
  useEffect(() => {
    if (!hasOrder || !location.state?.orderNumber) return undefined;

    const key = `void_downloaded_${orderNumber}`;
    if (sessionStorage.getItem(key) || downloadInitiated.current) return;

    downloadInitiated.current = true;
    sessionStorage.setItem(key, 'true');

    // Slight delay to ensure scripts can resolve smoothly
    const delayTimer = setTimeout(() => {
      downloadReceiptPDF(true);
    }, 800);

    return () => clearTimeout(delayTimer);
  }, [downloadReceiptPDF, hasOrder, location.state?.orderNumber, orderNumber]);

  useEffect(() => {
    if (!location.state?.orderNumber) return;

    savePendingReviewOrder({
      orderNumber,
      orderId,
      status: orderStatus,
      createdAt,
      total,
      items,
      shippingAddress,
      paymentMethod,
    });
  }, [location.state?.orderNumber, orderNumber, orderId, orderStatus, createdAt, total, items, shippingAddress, paymentMethod]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(String(orderNumber));
    toast({ title: 'Copied!', description: 'Order code copied to clipboard.', variant: 'default' });
  };

  if (!hasOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4" style={{ paddingTop: '108px', paddingBottom: '48px' }}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className="w-full max-w-lg"
      >
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-emerald-500" />
          </motion.div>

          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
            className="font-hero text-section-sm md:text-section font-bold text-ink-900"
            style={{ letterSpacing: '-0.03em' }}
          >
            Order Confirmed
          </motion.h1>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5, ease }}
            className="text-body text-ink-400 mt-2"
          >
            Thank you for your purchase. Your order has been placed successfully.
          </motion.p>
        </div>

        {/* Order Details Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease }}
          className="bg-white rounded-panel border border-surface-200 overflow-hidden"
        >
          {/* Order number */}
          <div className="p-6 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
            <div>
              <p className="text-caption text-ink-400 mb-1">Order Code</p>
              <div className="flex items-center gap-2">
                <p className="font-hero text-[18px] sm:text-[20px] font-bold text-ink-900">{orderNumber}</p>
                <button onClick={copyOrderNumber} className="p-1.5 rounded-btn hover:bg-surface-200 text-ink-400 hover:text-ink-600 transition-colors" title="Copy Order Code">
                  <Copy size={14} />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => downloadReceiptPDF(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-surface-200 bg-white text-caption font-semibold text-ink-600 hover:border-ink-900 hover:text-ink-900 transition-colors"
              title="Redownload Receipt PDF"
            >
              <Download size={14} />
              <span>Receipt PDF</span>
            </button>
          </div>

          {/* Items */}
          <div className="p-6 border-b border-surface-200">
            <p className="text-caption font-semibold text-ink-600 uppercase tracking-wide mb-3">Items Ordered</p>
            <div className="space-y-2">
              {items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-btn bg-surface-100 flex items-center justify-center text-ink-400">
                      <Package size={14} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-ink-900">{item.name}</p>
                      <p className="text-[11px] text-ink-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold text-ink-600">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="p-6 border-b border-surface-200 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-caption font-semibold text-ink-600 uppercase tracking-wide mb-2">Shipping To</p>
              <p className="text-[13px] text-ink-900 font-medium">{shippingAddress?.fullName}</p>
              <p className="text-[12px] text-ink-400 mt-0.5">{shippingAddress?.address}</p>
              <p className="text-[12px] text-ink-400">{shippingAddress?.city}</p>
              <p className="text-[12px] text-ink-400">{shippingAddress?.phone}</p>
            </div>
            <div>
              <p className="text-caption font-semibold text-ink-600 uppercase tracking-wide mb-2">Payment</p>
              <p className="text-[13px] text-ink-900 font-medium">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
              </p>
              <p className="text-[12px] text-ink-400 mt-0.5">
                {paymentMethod === 'cod' ? 'Pay when your order arrives' : 'Paid online'}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="p-6 flex justify-between items-center bg-surface-50">
            <p className="text-caption font-semibold text-ink-600 uppercase tracking-wide">Total Paid</p>
          <p className="font-hero text-[20px] font-bold text-ink-900">{formatPrice(total)}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.58, duration: 0.5, ease }}
          className="mt-5 rounded-panel border border-surface-200 bg-white p-5"
        >
          <div className="flex gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-surface-100 text-ink-600">
              <MessageSquareText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-caption font-semibold uppercase tracking-wide text-brand-500">Review after shipment</p>
              <h2 className="mt-1 font-hero text-card-title font-bold text-ink-900">Tell us after the product arrives</h2>
              <p className="mt-1 text-caption leading-relaxed text-ink-400">
                Your review form will be waiting in My Reviews once this order is shipped or the delivery window has passed.
              </p>
              <Link
                to="/reviews"
                className="mt-3 inline-flex items-center gap-2 text-caption font-semibold text-ink-900 transition-colors hover:text-brand-500"
              >
                Open My Reviews <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5, ease }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <Link
            to="/shop"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-btn bg-ink-900 text-white font-hero text-btn font-bold uppercase tracking-wide hover:bg-ink-600 transition-colors min-h-[48px]"
          >
            Continue Shopping <ArrowRight size={15} />
          </Link>
          <Link
            to="/"
            className="w-full sm:flex-1 inline-flex items-center justify-center py-3.5 px-6 rounded-btn border border-surface-300 text-ink-600 font-hero text-btn font-bold uppercase tracking-wide hover:border-ink-400 hover:text-ink-900 transition-colors min-h-[48px]"
          >
            Back to Home
          </Link>
        </motion.div>

        {/* Delivery notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-caption text-ink-400 mt-6"
        >
          Estimated delivery: from 24 to 48 hours
        </motion.p>
      </motion.div>
    </div>
  );
}
