/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          main: 'var(--color-bg-main)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        violet: {
          primary: 'var(--color-primary)',
          glow: 'var(--color-primary-glow)',
          soft: 'var(--color-primary-soft)',
        },
        income: 'var(--color-income)',
        expense: 'var(--color-expense)',
      },
    },
  },
  plugins: [],
}