/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f4f7ec',
          100: '#e5ebd3',
          200: '#cdd9ab',
          300: '#b0c279',
          400: '#96ac52',
          500: '#8fa948',
          600: '#6b8035',
          700: '#536330',
          800: '#44502b',
          900: '#3a4427',
          950: '#1d2512',
        },
        surface: {
          DEFAULT: '#191c21',
          alt: '#1e2228',
        },
        dark: {
          DEFAULT: '#0f1114',
          border: '#2a2f38',
          'border-light': '#363c47',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
