/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c121e',
        surface: '#151f2e',
        primary: '#00f2ff',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#3b4b60'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
