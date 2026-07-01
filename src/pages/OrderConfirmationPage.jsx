// ─────────────────────────────────────────────
// FILE: src/pages/OrderConfirmationPage.jsx
// Post-checkout success page with once-only auto-downloading PDF receipt
// ─────────────────────────────────────────────

import { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Banknote, CheckCircle, Copy, Download, Package, Truck } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { useToastStore } from '../store/useToastStore';
import { savePendingReviewOrder } from '../utils/reviews';
import logoImg from '../assets/logozadi_noback.png';

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

// Helper to load image as HTMLImageElement
const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

// Helper to render text (supporting Arabic/RTL) to a crisp base64 PNG image
const renderTextToImage = (lines, options = {}) => {
  const {
    fontSize = 13,
    lineHeight = 22,
    width = 400,
    height = 110,
    textColor = '#3c3c3c',
    align = 'left'
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Use scale factor of 4 for retina-grade crispness in PDF
  const scale = 4;
  canvas.width = width * scale;
  canvas.height = height * scale;
  
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, width, height);
  
  // Font stack supporting Arabic/Unicode natively
  ctx.font = `normal ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  
  lines.forEach((line, index) => {
    const yPos = index * lineHeight + 2;
    if (align === 'right') {
      ctx.textAlign = 'right';
      ctx.fillText(line, width - 4, yPos);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(line, 4, yPos);
    }
  });
  
  return canvas.toDataURL('image/png');
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
      doc.text('ZADI', 29.5, 29.5);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('Moroccan Online Store', 20, 38);

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
        toast({ title: 'تم تنزيل الوصل', description: 'تم حفظ وصل الطلب بصيغة PDF.', variant: 'success' });
      }
    } catch (e) {
      console.error('Failed to generate receipt PDF:', e);
      toast({ title: 'تعذر تنزيل الوصل', description: 'حاول مرة أخرى بعد قليل.', variant: 'warning' });
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
    toast({ title: 'تم النسخ', description: 'تم نسخ رقم الطلب.', variant: 'default' });
  };

  if (!hasOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <main
      className="min-h-screen bg-surface-50 px-4 pb-14 pt-[108px] font-arabic text-ink-900"
      dir="rtl"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease }}
        className="mx-auto w-full max-w-2xl"
      >
        <header className="mb-7 text-center sm:mb-8">
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease, delay: 0.1 }}
            className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"
          >
            <CheckCircle size={34} />
          </motion.div>
          <h1 className="text-[28px] font-bold leading-tight sm:text-[34px]">تم تأكيد طلبك</h1>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-7 text-ink-500">
            شكراً لك. توصلنا بطلبك وسنتواصل معك لتأكيد معلومات التوصيل.
          </p>
        </header>

        <section className="overflow-hidden rounded-lg border border-surface-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-surface-200 bg-surface-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-[11px] font-semibold text-ink-400">رقم الطلب</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-[18px] font-extrabold" dir="ltr">{orderNumber}</p>
                <button
                  type="button"
                  onClick={copyOrderNumber}
                  aria-label="نسخ رقم الطلب"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-surface-200 hover:text-ink-700"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadReceiptPDF(true)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-surface-300 bg-white px-4 text-[12px] font-bold text-ink-700 sm:w-auto"
            >
              <Download size={15} />
              تنزيل وصل الطلب
            </button>
          </div>

          <div className="border-b border-surface-200 p-4 sm:p-5">
            <h2 className="mb-3 text-[13px] font-bold">المنتجات</h2>
            <div className="divide-y divide-surface-200">
              {items.map((item, index) => (
                <article key={`${item.id || item.name}-${index}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-100 text-ink-500">
                    <Package size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">الكمية: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-[13px] font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5 border-b border-surface-200 p-4 sm:grid-cols-2 sm:p-5">
            <div className="flex items-start gap-3">
              <Truck size={18} className="mt-0.5 shrink-0 text-ink-600" />
              <div className="min-w-0">
                <h2 className="text-[13px] font-bold">معلومات التوصيل</h2>
                <p className="mt-2 text-[13px] font-semibold">{shippingAddress?.fullName}</p>
                <p className="mt-1 text-[12px] leading-6 text-ink-500">
                  {shippingAddress?.address}
                  {shippingAddress?.city ? `، ${shippingAddress.city}` : ''}
                </p>
                <p className="mt-1 text-[12px] text-ink-500" dir="ltr">
                  {shippingAddress?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Banknote size={18} className="mt-0.5 shrink-0 text-ink-600" />
              <div>
                <h2 className="text-[13px] font-bold">طريقة الدفع</h2>
                <p className="mt-2 text-[13px] font-semibold">
                  {paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'الدفع بالبطاقة'}
                </p>
                <p className="mt-1 text-[12px] leading-6 text-ink-500">
                  {paymentMethod === 'cod' ? 'يتم الدفع بعد وصول الطلب.' : 'تم تسجيل عملية الدفع.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface-50 p-4 sm:p-5">
            <p className="text-[13px] font-bold">المبلغ الإجمالي</p>
            <p className="text-[20px] font-extrabold">{formatPrice(total)}</p>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 text-[14px] font-bold text-white transition-colors hover:bg-ink-600"
          >
            متابعة التسوق
            <ArrowLeft size={16} />
          </Link>
          <Link
            to="/reviews"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-surface-300 bg-white px-5 text-[14px] font-bold text-ink-700"
          >
            طلباتي وآرائي
          </Link>
        </div>

        <p className="mt-5 text-center text-[12px] leading-6 text-ink-400">
          مدة التوصيل المتوقعة من 24 إلى 48 ساعة.
        </p>
      </motion.div>
    </main>
  );
}
