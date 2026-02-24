/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        backgroundMuted: '#F7F7F7',
        surface: '#FFFFFF',
        border: '#E5E5E5',
        text: '#111111',
        textMuted: '#666666',
        textFaint: '#888888',
        primary: '#111111',
        primaryText: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
