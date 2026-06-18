// ─────────────────────────────────────────────
// FILE: tailwind.config.js
// ─────────────────────────────────────────────

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e0e1ff',
          400: '#8b8cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        surface: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d1d1d6',
        },
        ink: {
          900: '#09090b',
          600: '#52525b',
          400: '#a1a1aa',
          200: '#e4e4e7',
        },
        feedback: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger:  '#ef4444',
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Comico', 'Georgia', 'serif'],
        comico:  ['Comico', 'Georgia', 'serif'],
        hero:    ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        clash:   ['"Clash Display"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero':    ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-sm': ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'section': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'section-sm': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'card-title': ['18px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body':    ['16px', { lineHeight: '1.7' }],
        'caption': ['13px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'btn':     ['14px', { lineHeight: '1', letterSpacing: '0.02em' }],
        'price':   ['28px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'nav':     ['14px', { lineHeight: '1', letterSpacing: '0.01em' }],
      },
      spacing: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
      },
      borderRadius: {
        'tag':    '4px',
        'btn':    '8px',
        'card':   '12px',
        'panel':  '16px',
        'modal':  '24px',
        'pill':   '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 12px rgba(0,0,0,0.07)',
        'lg': '0 12px 32px rgba(0,0,0,0.10)',
        'xl': '0 24px 64px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'slide-up':  'slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':   'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};