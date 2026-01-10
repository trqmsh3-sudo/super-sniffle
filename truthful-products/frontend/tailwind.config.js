export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Modern SaaS Color Palette
        // Inspired by: Linear, Stripe, Vercel
        
        // Primary - Purple (Innovation & Trust)
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // Main
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        
        // Secondary - Cyan (Clarity & Intelligence)
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // Main
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        
        // Accent - Rose (Action & Energy)
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',  // Main
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        
        // Neutrals - Slate (Professional)
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',  // Main dark
          950: '#020617',  // Deepest
        },
        
        // Success, Warning, Error (vibrant)
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        
        // Legacy compatibility
        navy: '#0f172a',
        'navy-light': '#1e293b',
        mint: '#a855f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-3': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      boxShadow: {
        'glow-purple': '0 0 60px rgba(168, 85, 247, 0.4)',
        'glow-cyan': '0 0 60px rgba(6, 182, 212, 0.4)',
        'glow-rose': '0 0 60px rgba(244, 63, 94, 0.4)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.5)',
        'premium-lg': '0 30px 80px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'glass-lg': '16px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 80px rgba(168, 85, 247, 0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
