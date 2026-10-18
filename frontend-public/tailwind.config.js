/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          50: '#f4f6fb',
          100: '#e8edf6',
          200: '#cddbee',
          300: '#a3bfe1',
          400: '#729dd0',
          500: '#4e7ebd',
          600: '#3a64a3',
          700: '#2f5084',
          800: '#2a446e',
          900: '#1f3353',
          950: '#142036',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
