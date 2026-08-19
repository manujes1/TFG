/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Oliva/musgo: color de marca. Un verde terroso y saturado,
        // no el verde-menta pálido de plantilla SaaS. Se usa también
        // como fondo de página (refugio-50), así que evitamos tonos
        // lavados que vuelvan a leerse como "blanco con matiz".
        refugio: {
          50: '#e2d9bb',
          100: '#cec190',
          200: '#a89968',
          500: '#5b6a3f',
          600: '#414a2b',
          700: '#2e3520',
          900: '#1c2015'
        },
        // Terracota: acento cálido y con cuerpo, reservado para la acción
        // principal y el elemento de firma (ficha tipo etiqueta de perrera).
        acento: {
          50: '#f2d9c2',
          100: '#e7ba91',
          400: '#c96a34',
          500: '#a94f22',
          600: '#833c1a'
        },
        tinta: '#241d13',
        // Superficie de las tarjetas: arcilla clara, no blanco.
        papel: '#efe1c4'
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(34, 40, 31, 0.06), 0 4px 16px -4px rgba(33, 60, 41, 0.12)',
        'card-hover': '0 2px 4px rgba(34, 40, 31, 0.08), 0 8px 24px -6px rgba(33, 60, 41, 0.18)'
      }
    }
  },
  plugins: []
};
