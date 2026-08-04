import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0f', darker: '#0d0d1a', dark: '#111127', card: '#161630',
          border: '#1e1e3a', blue: '#00d4ff', cyan: '#00e5ff', purple: '#7c3aed',
          green: '#10b981', red: '#ef4444', yellow: '#f59e0b', orange: '#f97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        glow: { '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.3)' }, '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scanLine: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
