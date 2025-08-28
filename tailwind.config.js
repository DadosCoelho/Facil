/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--text)',
        card: {
          DEFAULT: 'var(--card)',
          secondary: 'var(--card-2)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
        },
        border: 'var(--border)',
        accent: 'var(--accent)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius-sm)',
        sm: 'var(--radius-xs)',
      },
    },
  },
  plugins: [],
}
