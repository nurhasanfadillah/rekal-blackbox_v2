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
        canvas: '#F1F2F2',
        'surface-1': '#FFFFFF',
        'surface-2': '#E7E8E8',
        hairline: '#D4D6D5',
        'hairline-soft': '#E1E2E0',
        // ── Text ───────────────────────────────────────────────
        ink: '#202326',
        'ink-muted': '#62696D',
        // ── Brand ──────────────────────────────────────────────
        'accent-blue': '#A95C19',
        'deep-blue': '#A95C19',
        'accent-amber': '#C78324',
        // ── Semantic ───────────────────────────────────────────
        success: '#58763A',
        danger: '#A64038',
        warning: '#C78324',
        // ── Aliases (backward-compat) ──────────────────────────
        'accent-rose': '#A64038',
        'accent-emerald': '#58763A',
        // ── Primary scale ──────────────────────────────────────
        primary: {
          50: '#FBF5EC',
          100: '#F5E2CA',
          300: '#E7B77F',
          400: '#D9954A',
          500: '#A95C19',
          600: '#974F16',
          700: '#A95C19',
          900: '#6B431B',
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
