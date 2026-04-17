/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        ethereal: {
          dark:      '#0d1117',
          card:      '#161b22',
          green:     '#b4f68c',
          purple:    '#c084fc',
          red:       '#f43f5e',
          text:      '#e6edf3',
          textMuted: '#8b949e',
        },
        orbix: {
          purple:    '#8B5CF6',
          bg:        '#f3f4f6',
          card:      '#ffffff',
          text:      '#0f172a',
          textMuted: '#374151',
        },
        // CSS variable wrappers for components that use var() via Tailwind
        background: 'var(--bg)',
        surface:    'var(--surface)',
      },
      boxShadow: {
        card:  '0 8px 30px rgba(0,0,0,0.05)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      borderRadius: {
        xl4: '32px',
      },
    },
  },
  plugins: [],
};
