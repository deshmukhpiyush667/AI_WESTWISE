/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Only activated if .dark class is added (which is never added)
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16845B',
          hover: '#126e4b',
          dark: '#0e553a',
          light: '#22a070',
        },
        mint: {
          DEFAULT: '#EAF5EC',
          soft: '#F2F9F3',
          border: '#D3EAD7',
        },
        surface: {
          background: '#F7FAF7',
          card: '#FFFFFF',
          muted: '#F0F5F1',
        },
        ink: {
          main: '#183B2B',
          secondary: '#52705F',
          muted: '#7A9A87',
        },
        waste: {
          organic: '#16845B',
          plastic: '#2563EB',
          paper: '#0284C7',
          metal: '#D97706',
          glass: '#0D9488',
          hazardous: '#DC2626',
          uncertain: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(22, 132, 91, 0.08), 0 1px 4px -1px rgba(22, 132, 91, 0.04)',
        'card': '0 4px 20px -2px rgba(24, 59, 43, 0.06)',
        'modal': '0 20px 40px -15px rgba(24, 59, 43, 0.15)',
      }
    },
  },
  plugins: [],
}
