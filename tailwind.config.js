/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          500: '#3b5bdb',
          600: '#2f4ac7',
          700: '#1e3a8a',
          800: '#1e3070',
          900: '#0f1f52',
        }
      }
    },
  },
  plugins: [],
}
