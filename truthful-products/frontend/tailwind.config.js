export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#0A1628',
        'bg-secondary': '#1a1f3a',
        
        // Primary colors (Mint Green)
        primary: '#00FFB3',
        'primary-hover': '#3AFFA3',
        
        // Secondary colors (Electric Blue)
        secondary: '#00D4FF',
        
        // Accent colors (Purple-Pink)
        accent: '#C850FF',
        
        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#E0E0E0',
        'text-muted': '#9CA3AF',
        
        // Functional colors
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        
        // Legacy support (keeping old names for compatibility)
        navy: '#0A1628',
        'navy-light': '#1a1f3a',
        mint: '#00FFB3',
        'mint-light': '#3AFFA3',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(0, 255, 179, 0.4)',
        'glow-secondary': '0 0 30px rgba(0, 212, 255, 0.4)',
        'glow-accent': '0 0 30px rgba(200, 80, 255, 0.4)',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
};
