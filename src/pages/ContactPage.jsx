// ─────────────────────────────────────────────
// FILE: src/pages/ContactPage.jsx
// Contact form, store info, WhatsApp, FAQ
// ─────────────────────────────────────────────

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Send, ChevronDown } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

const ease = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  visible: (i = 0) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease },
  }),
};

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'support@voidstore.ma', href: 'mailto:support@voidstore.ma' },
  { icon: Phone, label: 'Phone', value: '+212 6 12 34 56 78', href: 'tel:+212612345678' },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/212612345678', accent: true },
  { icon: MapPin, label: 'Address', value: 'Casablanca, Morocco', href: null },
];

const FAQ = [
  { q: 'How long does delivery take?', a: 'Most orders are delivered within 2-5 business days across Morocco. Express shipping is available for major cities.' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (الدفع عند الاستلام), which is our most popular payment method. Credit card payments are coming soon.' },
  { q: 'Can I return or exchange a product?', a: 'Yes! We offer free returns within 14 days of delivery. Products must be in original packaging and unused condition.' },
  { q: 'Do you ship internationally?', a: 'Currently, we only ship within Morocco. International shipping is planned for 2026.' },
  { q: 'How can I track my order?', a: "Once your order ships, you'll receive a tracking number via SMS or WhatsApp. You can also contact us directly for updates." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[15px] font-semibold text-ink-900 group-hover:text-brand-500 transition-colors pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-ink-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease }}
        className="overflow-hidden"
      >
        <p className="text-body text-ink-400 pb-4 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

export default function ContactPage() {
  const toast = useToastStore((s) => s.toast);
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: '-60px' });

  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'warning' });
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setForm({ name: '', phone: '', subject: '', message: '' });
    toast({ title: 'Message Sent!', description: "We'll get back to you within 24 hours.", variant: 'success' });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* ── Header ── */}
      <section className="border-b border-surface-200 bg-surface-0 pb-12 pt-[116px] sm:pb-16 sm:pt-[132px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease }}
            className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-3"
          >
            Get in Touch
          </motion.p>
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.08 }}
            className="font-hero text-section-sm md:text-section font-bold text-ink-900"
            style={{ letterSpacing: '-0.03em' }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease, delay: 0.16 }}
            className="text-body text-ink-400 mt-2 max-w-md mx-auto"
          >
            Have a question or need help? We're here for you.
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">
          {/* ── Contact Form ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <h2 className="font-hero text-card-title font-bold text-ink-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-medium text-ink-600 mb-1.5">Name *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-caption font-medium text-ink-600 mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" placeholder="+212 6 XX XX XX XX" />
                </div>
              </div>
              <div>
                <label className="block text-caption font-medium text-ink-600 mb-1.5">Subject</label>
                <input value={form.subject} onChange={(e) => set('subject', e.target.value)} className="input-field" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-caption font-medium text-ink-600 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className="input-field resize-none" placeholder="Tell us more..." />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-btn font-hero text-btn font-bold uppercase tracking-wide hover:bg-ink-600 transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* ── Contact Info Sidebar ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <h2 className="font-hero text-card-title font-bold text-ink-900 mb-6">Contact Info</h2>
            <div className="space-y-3">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="flex items-start gap-3.5 p-3.5 rounded-card bg-white border border-surface-200 hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 ${c.accent ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-100 text-ink-400'}`}>
                    <c.icon size={18} />
                  </div>
                  <div>
                    <p className="text-caption font-semibold text-ink-600 uppercase tracking-wide">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-[14px] font-medium text-ink-900 hover:text-brand-500 transition-colors">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-[14px] font-medium text-ink-900">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/212612345678"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-btn bg-emerald-500 text-white font-hero text-btn font-bold uppercase tracking-wide hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section ref={faqRef} className="bg-surface-0 border-t border-surface-200 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={faqInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">FAQ</p>
            <h2 className="font-hero text-section-sm md:text-section font-bold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={faqInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="bg-white rounded-panel border border-surface-200 p-6"
          >
            {FAQ.map((item) => (
              <FAQItem key={item.q} {...item} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
