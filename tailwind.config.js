/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1220',
        panel: '#111a2b',
        edge: '#1f2c44',
        muted: '#8195b5',
        off: '#f2555a',
        drift: '#e6a13c',
        ontrack: '#3fb984',
        accent: '#5b8def',
      },
    },
  },
  plugins: [],
}
