/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        teal: {
          DEFAULT: '#0f766e',
          light:   '#ccfbf1',
          mid:     '#14b8a6',
        },
        bg: {
          DEFAULT: '#f0f4f8',
          2:       '#e8edf3',
        },
      },
      boxShadow: {
        card:       '6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.85)',
        'card-hover':'8px 8px 20px rgba(0,0,0,0.10), -6px -6px 16px rgba(255,255,255,0.9)',
        inset:      'inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.8)',
      },
      borderRadius: {
        xl2: '20px',
        xl3: '24px',
      },
    },
  },
  plugins: [],
};
