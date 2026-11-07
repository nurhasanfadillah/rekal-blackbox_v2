/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds & surfaces ──────────────────────────────
        canvas: '#0B1B3C',
        'surface-1': '#E6E6E6',
        'surface-2': '#D4D4D4',
        hairline: 'rgba(255,255,255,0.14)',
        'hairline-soft': 'rgba(255,255,255,0.08)',
        'hairline-on-surface': 'rgba(0,0,0,0.12)',
        // ── Text ───────────────────────────────────────────────
        ink: '#000000',
        'ink-muted': '#374151',
        // ── Brand ──────────────────────────────────────────────
        'accent-blue': '#0A447B',
        'deep-blue': '#0A4C8A',
        'accent-secondary': '#3B82F6',
        // ── Semantic ───────────────────────────────────────────
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
        // ── Aliases ────────────────────────────────────────────
        'accent-rose': '#DC2626',
        'accent-emerald': '#16A34A',
        // ── Primary scale ──────────────────────────────────────
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          300: '#93C5FD',
          400: '#3B82F6',
          500: '#0A447B',
          600: '#0A4C8A',
          700: '#093D6D',
          900: '#062B4E',
        },
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
