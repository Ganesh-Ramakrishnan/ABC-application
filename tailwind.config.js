/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sidebar: '#1C2333',
        surface: '#FFFFFF',
        muted:   '#F3F4F6',
        border:  '#E5E7EB',
        success: {
          50:  '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        danger: {
          50:  '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        'comic': ['Comic Sans MS', 'cursive', 'sans-serif'],
        'kids':  ['Fredoka One', 'cursive', 'sans-serif'],
        'sans':  ['Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        'card-md':'0 4px 12px rgba(0,0,0,.10)',
        'orange': '0 4px 14px rgba(249,115,22,.35)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle':      'wiggle 1s ease-in-out infinite',
        'pop':         'pop 0.4s ease-out',
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.35s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
