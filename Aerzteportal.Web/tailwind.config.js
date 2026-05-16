/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors backed by CSS variables so they swap at runtime.
        // Defaults are set in index.css; per-brand overrides via [data-brand="..."] selectors.
        brand: {
          red: 'rgb(var(--brand-red) / <alpha-value>)',
          'red-dark': 'rgb(var(--brand-red-dark) / <alpha-value>)',
          'red-light': 'rgb(var(--brand-red-light) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['TheSans', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
