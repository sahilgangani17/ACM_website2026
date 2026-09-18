/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        city: {
          dark: '#02040a',
          navy: '#060d1b',
          panel: '#0b1528',
          cyan: '#06b6d4',
          electric: '#3b82f6',
          purple: '#a855f7',
          magenta: '#e02424',
          accent: '#00f0ff',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 25px rgba(168, 85, 247, 0.4)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
