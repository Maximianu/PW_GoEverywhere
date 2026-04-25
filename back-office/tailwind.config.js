/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c121e',
        surface: '#151f2e',
        primary: '#00f2ff',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#3b4b60',
        // Cores por funcionalidade (tema lunar integrado)
        'color-lua': '#00f2ff',
        'color-dashboard': '#3b82f6',
        'color-pedidos': '#ef4444',
        'color-historico': '#f59e0b',
        'color-clientes': '#10b981',
        'color-estafetas': '#a78bfa',
        'color-mapa': '#06b6d4'
      },
      backgroundImage: {
        'gradient-lunar': 'radial-gradient(circle at 50% 50%, rgba(0, 242, 255, 0.1) 0%, rgba(0, 20, 40, 0.3) 50%, #0c121e 100%)',
        'gradient-dashboard': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(12, 18, 30, 0.8) 100%)',
        'gradient-pedidos': 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(12, 18, 30, 0.8) 100%)',
        'gradient-historico': 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(12, 18, 30, 0.8) 100%)',
        'gradient-clientes': 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(12, 18, 30, 0.8) 100%)',
        'gradient-estafetas': 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(12, 18, 30, 0.8) 100%)',
        'gradient-mapa': 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(12, 18, 30, 0.8) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(21, 31, 46, 0.8) 0%, rgba(12, 18, 30, 0.6) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 242, 255, 0.3)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-red': '0 0 30px rgba(239, 68, 68, 0.3)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.3)',
        'glow-green': '0 0 30px rgba(16, 185, 129, 0.3)',
        'glow-purple': '0 0 30px rgba(167, 139, 250, 0.3)',
        'glow-cyan-lg': '0 0 50px rgba(0, 242, 255, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'elevation': '0 20px 40px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in-up': 'slide-in-up 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 10px rgba(0, 242, 255, 0.3)' },
          '50%': { textShadow: '0 0 20px rgba(0, 242, 255, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in-up': {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      backdropBlur: {
        glass: '10px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      }
    },
  },
  plugins: [],
}
