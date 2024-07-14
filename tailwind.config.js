/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/src/**/*.{html,js,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate"),require('@tailwindcss/aspect-ratio'),],
}

