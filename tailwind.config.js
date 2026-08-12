/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          950: '#161412',
          900: '#1c1712',
          800: '#211b16',
          700: '#3a2f26',
          600: '#4a4038',
        },
        ember: {
          400: '#ffab00',
          500: '#ff5722',
          600: '#e64a19',
        },
      },
    },
  },
  plugins: [],
};