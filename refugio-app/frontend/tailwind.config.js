/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa del refugio (verdes cálidos)
        refugio: {
          50: '#f0f9f4',
          100: '#dcf1e3',
          500: '#3fa66b',
          600: '#2f8555',
          700: '#256a44'
        }
      }
    }
  },
  plugins: []
};
