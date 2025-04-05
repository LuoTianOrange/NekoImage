/** @type {import('tailwindcss').Config} */
module.exports = {
  // mode: "selector",
  content: ["./src/renderer/src/**/*.{html,js,vue,jsx}"],
  darkMode: ['class', "[class~='dark']"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/aspect-ratio'),],
}

