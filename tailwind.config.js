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
          DEFAULT: "#00ed64", // MongoDB Green
          hover: "#00c853",
          light: "#e6fcf5"
        },
        secondary: "#001e2b", // MongoDB Dark Slate
        accent: "#00684a",
        background: "#f9fbfa",
        surface: "#ffffff",
        border: "#e8edea",
        dark: {
          sidebar: "#001e2b",
          header: "#ffffff",
        }
      }
    },
  },
  plugins: [],
}
