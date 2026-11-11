/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        vsc: {
          bg: '#1e1e1e',
          panel: '#252526',
          side: '#181818',
          border: '#2d2d2d',
          line: '#2a2d2e',
          gutter: '#858585',
          accent: '#007acc',
        },
      },
    },
  },
  plugins: [],
};
