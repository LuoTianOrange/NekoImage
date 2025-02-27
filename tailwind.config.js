/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/renderer/src/**/*.{html,js,vue,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate"),require('@tailwindcss/aspect-ratio'),],
}

