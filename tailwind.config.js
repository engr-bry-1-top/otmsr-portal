/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: '#800020', light: '#9B1B30', dark: '#5C0018' },
        navy: { DEFAULT: '#1E3A5F', light: '#2A4A7F', dark: '#0F2440' },
        charcoal: { DEFAULT: '#1a1a1a', light: '#4A4A4A', muted: '#6B6B6B' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'slide-up': 'slideUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
        'shake': 'shake 0.3s ease-in-out',
        'orbit-1': 'orbit1 20s ease-in-out infinite',
        'orbit-2': 'orbit2 25s ease-in-out infinite',
        'orbit-3': 'orbit3 15s ease-in-out infinite',
        'pulse-slow': 'pulse 6s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        orbit1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        orbit2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-30px, -40px) scale(1.15)' },
          '66%': { transform: 'translate(50px, 30px) scale(0.85)' },
        },
        orbit3: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.3)' },
        },
      },
    },
  },
  plugins: [],
}