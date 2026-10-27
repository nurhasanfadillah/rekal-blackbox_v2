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
        canvas: '#0A0F14',
        'surface-1': '#121A22',
        'surface-2': '#1A2530',
        hairline: '#2A3945',
        'hairline-soft': '#22313C',
        // ── Text ───────────────────────────────────────────────
        ink: '#F2F6F8',
        'ink-muted': '#9AAAB5',
        // ── Brand ──────────────────────────────────────────────
        'accent-blue': '#43C6F4',
        'deep-blue': '#148DB9',
        'accent-amber': '#F4B740',
        // ── Semantic ───────────────────────────────────────────
        success: '#A6E66B',
        danger: '#FF726B',
        warning: '#F4B740',
        // ── Aliases (backward-compat) ──────────────────────────
        'accent-rose': '#FF726B',
        'accent-emerald': '#A6E66B',
        // ── Primary scale ──────────────────────────────────────
        primary: {
          50: '#E9FAFF',
          100: '#CFF3FF',
          300: '#8AE2FF',
          400: '#63D4FA',
          500: '#43C6F4',
          600: '#1EA8D6',
          700: '#148DB9',
          900: '#0C4C65',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
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
