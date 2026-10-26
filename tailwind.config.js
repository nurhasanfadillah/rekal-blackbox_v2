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
        canvas: '#F4F7FB',
        'surface-1': '#FFFFFF',
        'surface-2': '#EBF0F6',
        hairline: '#D8E0EA',
        'hairline-soft': '#E8EDF4',
        // ── Text ───────────────────────────────────────────────
        ink: '#172B4D',
        'ink-muted': '#52627A',
        // ── Brand ──────────────────────────────────────────────
        'accent-blue': '#155EEF',
        'deep-blue': '#0B3B8C',
        'accent-amber': '#FFB020',
        // ── Semantic ───────────────────────────────────────────
        success: '#16803D',
        danger: '#D92D20',
        warning: '#B54708',
        // ── Aliases (backward-compat) ──────────────────────────
        'accent-rose': '#D92D20',
        'accent-emerald': '#16803D',
        // ── Primary scale ──────────────────────────────────────
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#155EEF',
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#0B3B8C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
