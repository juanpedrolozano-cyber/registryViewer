/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        bg: {
          DEFAULT: '#0b0f17',
          elev: '#111827',
          panel: '#0f172a',
        },
        line: '#1f2937',
        ink: {
          DEFAULT: '#e5e7eb',
          muted: '#94a3b8',
          dim: '#64748b',
        },
        ok: '#10b981',
        info: '#3b82f6',
        warn: '#f59e0b',
        err: '#ef4444',
        retry: '#a855f7',
      },
    },
  },
  plugins: [],
};
