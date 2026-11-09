/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        refugio: {
          50: '#fef5ed',
          100: '#fde7d3',
          200: '#fac9a1',
          300: '#f6a563',
          400: '#f0813a',
          500: '#e2631c',
          600: '#c14e13',
          700: '#9c3f13',
          800: '#7d3415',
          900: '#672d14'
        },
        // Acento para las funciones de IA
        teal: {
          50: '#eefcfa',
          100: '#d2f5f0',
          200: '#a9e9e0',
          300: '#75d6ca',
          400: '#43b8ac',
          500: '#279388',
          600: '#1c766d',
          700: '#1a5f59',
          800: '#1a4c48',
          900: '#193f3c'
        },
        sand: {
          50: '#fbf8f2',
          100: '#f5eee0',
          200: '#e9dcc3',
          300: '#d9c4a0'
        }
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 2px 0 rgb(15 23 42 / 0.03), 0 2px 10px -2px rgb(15 23 42 / 0.07)',
        'card-hover': '0 6px 20px -6px rgb(15 23 42 / 0.14), 0 2px 6px -2px rgb(15 23 42 / 0.06)',
        elevated: '0 16px 40px -12px rgb(15 23 42 / 0.22)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
        popIn: 'popIn 0.18s ease-out'
      }
    }
  },
  plugins: []
};
