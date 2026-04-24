/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ed64',
          hover: '#00c352',
        },
        secondary: '#001e2b',
        background: '#f9fbfa',
        accent: '#00ed64',
        border: '#e3e3e3',
        error: '#f26161',
        success: '#00ed64',
      },
      fontSize: {
        'xs': '10px',
        'sm': '12px',
        'base': '12px',
        'lg': '14px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
