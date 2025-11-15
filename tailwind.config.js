/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#FACC15',
        success: '#16A34A',
        error: '#DC2626',
        border: '#E5E7EB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        background: '#F9FAFB',
      },
    },
  },
  plugins: [],
}

