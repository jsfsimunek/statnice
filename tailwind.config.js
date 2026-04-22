/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#84a8ff',
          400: '#5080f8',
          500: '#3060e8',
          600: '#1d46d4',
          700: '#1836ad',
          800: '#1a308c',
          900: '#1b2c6f',
        },
      },
    },
  },
  plugins: [],
}
