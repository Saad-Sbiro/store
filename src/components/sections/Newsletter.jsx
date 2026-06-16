// ─────────────────────────────────────────────
// FILE: src/components/sections/Newsletter.jsx
// ─────────────────────────────────────────────

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { fadeUp, stagger } from '../../utils/motionVariants';

export default function Newsletter() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      id="newsletter"
      aria-label="Newsletter signup"
      ref={sectionRef}
      className="border-y border-surface-200 bg-surface-100 py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-panel bg-brand-50 flex items-center justify-center">
              <Mail size={22} className="text-brand-500" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="font-display font-semibold text-section-sm md:text-section text-ink-900 mb-4"
          >
            Get the next setup drop.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-body text-ink-600 mb-8"
          >
            New gear, useful setup notes, and early access to limited releases.
            No spam, no noise.
          </motion.p>

          {/* Form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 max-w-md mx-auto sm:flex-row"
            aria-label="Newsletter email form"
          >
            {submitted ? (
              <div className="flex-1 flex items-center justify-center gap-2 h-12 rounded-btn bg-feedback-success/10 border border-feedback-success/20 text-feedback-success font-medium text-btn">
                <Check size={16} />
                You're on the list!
              </div>
            ) : (
              <>
                <div className="flex-1 relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                  />
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-12 pl-10 pr-4 rounded-btn bg-white border border-surface-200 text-body text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  />
                </div>
                <button
                  id="newsletter-submit"
                  type="submit"
                  className="h-12 px-6 rounded-btn bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-btn font-medium flex items-center gap-2 shrink-0 transition-colors duration-200 group"
                >
                  Subscribe
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </>
            )}
          </motion.form>

          {/* Micro-copy */}
          <motion.p variants={fadeUp} className="text-caption text-ink-400 mt-4">
            By subscribing you agree to our{' '}
            <a href="/" className="underline hover:text-ink-600 transition-colors">Privacy Policy</a>.
            Unsubscribe any time.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
