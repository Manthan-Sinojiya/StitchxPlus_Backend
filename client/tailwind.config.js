/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Luxury Light Canvas & Backgrounds
        cream: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#EFECE4',
          300: '#E4DFD3',
          400: '#D2C9B8',
          500: '#C0B39D',
        },
        // Charcoal Typography & Neutrals
        charcoal: {
          50: '#F7F8FA',
          100: '#ECEEF2',
          200: '#DADEE5',
          300: '#B8C0CC',
          400: '#8A94A6',
          500: '#646D7E',
          600: '#474F5E',
          700: '#323844',
          800: '#21252E',
          900: '#15171D',
          950: '#0E0F13',
        },
        // Warm Bronze Luxury Accent Color
        bronze: {
          50: '#FDFBF7',
          100: '#F7EFDE',
          200: '#EFDFBD',
          300: '#E2CA94',
          400: '#CDAA66',
          500: '#B38E46', // Primary Accent
          600: '#967433', // Accent Hover
          700: '#755A25',
          800: '#543F19',
          900: '#38290E',
        },
        // Legacy Navy Token Scale (Dark Charcoal / Slate)
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0B0F19',
        },
        // Legacy Gold Token Scale (Warm Bespoke Accent)
        gold: {
          50: '#FFFDF7',
          100: '#FAF3E0',
          200: '#F3E5C2',
          300: '#E6D29D',
          400: '#D5BC78',
          500: '#B38E46',
          600: '#967433',
          700: '#755A25',
          800: '#543F19',
          900: '#38290E',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'h1': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h2': ['1.875rem', { lineHeight: '1.3' }],
        'h3': ['1.5rem', { lineHeight: '1.35' }],
        'h4': ['1.25rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      spacing: {
        'space-1': '0.25rem', // 4px
        'space-2': '0.5rem',  // 8px
        'space-3': '0.75rem', // 12px
        'space-4': '1rem',    // 16px
        'space-6': '1.5rem',  // 24px
        'space-8': '2rem',    // 32px
        'space-12': '3rem',   // 48px
        'space-16': '4rem',   // 64px
        'space-24': '6rem',   // 96px
      },
      boxShadow: {
        subtle: '0 2px 10px 0 rgba(14, 15, 19, 0.03)',
        card: '0 4px 20px 0 rgba(14, 15, 19, 0.05)',
        elevated: '0 12px 32px -4px rgba(14, 15, 19, 0.08)',
        modal: '0 20px 50px -10px rgba(14, 15, 19, 0.16)',
        bronze: '0 8px 24px -4px rgba(179, 142, 70, 0.25)',
      },
      borderRadius: {
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
