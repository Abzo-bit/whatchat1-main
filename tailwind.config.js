/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-dark': '#111B21',
        'whatsapp-darker': '#0B141A',
        'whatsapp-gray': '#222E35',
        'whatsapp-gray-light': '#2A3942',
        'whatsapp-green': '#00A884',
        'whatsapp-green-dark': '#008C6F',
      },
    },
  },
  plugins: [],
}

