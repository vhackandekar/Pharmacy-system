/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'primary': 'var(--color-primary)',
          'secondary': 'var(--color-secondary)',
          'accent': 'var(--color-accent)',
          'soft-accent': 'var(--color-soft-accent)',
          'background': 'var(--color-bg)',
          'card': 'var(--color-card)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'border-color': 'var(--color-border)',
          'success': 'var(--color-success)',
          'warning': 'var(--color-warning)',
          'error': 'var(--color-error)',
          'hover-tint': 'var(--color-hover)',
          'sidebar': {
            'bg': 'var(--sidebar-bg)',
            'text': 'var(--sidebar-text)',
            'text-muted': 'var(--sidebar-text-muted)',
            'hover': 'var(--sidebar-hover)',
            'active': 'var(--sidebar-active)',
            'border': 'var(--sidebar-border)',
          }
        },
        'deep-black': '#0B0F19', // Keeping for backward compat if needed
        'neon-purple': '#A855F7',
        'electric-purple': '#7C3AED',
        'deep-purple': '#4C1D95',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 5px #A855F7)' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 20px #A855F7)' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}


