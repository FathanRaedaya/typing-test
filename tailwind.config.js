/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html","./src/**/*.js"],
  theme: {
    extend: {
    },
    fontFamily: {
      'it': ['it', 'sans-serif'],
      'mont': ['mont', 'sans-serif'],
      'montM': ['montM', 'sans-serif'],
      'montL': ['montL', 'sans-serif'],
      'lmr': ['lmr', 'sans-serif'],
    },
  },
  plugins: [],
}