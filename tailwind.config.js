/** @type {import('tailwindcss').Config} */
export default {
  content: ['./popup.html', './dashboard.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd3ff',
          300: '#90b6ff',
          400: '#5c8dfd',
          500: '#3866f8',
          600: '#2347ed',
          700: '#1b35d9',
          800: '#1d2eb0',
          900: '#1d2d8b',
        },
      },
    },
  },
  plugins: [],
};
