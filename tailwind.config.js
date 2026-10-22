/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        ops: {
          bg: '#0b0f19',
          surface: '#111827',
          card: '#1f2937',
          border: '#374151',
          hover: '#1e293b',
          accent: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
