/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#D4AF37',
        'violet-glow': '#8B2E52',
        'electric-pink': '#4A0E2A',
        'dark-accent': '#15030C',
        'base-white': '#FDF8F1',
        'burgundy': '#6B1B3D',
        'maroon': '#4A0E2A',
        'gold': '#D4AF37',
        'gold-light': '#F4D03F',
        'burgundy-light': '#8B2E52'
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 1.5s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out'
      },
      keyframes: {
        glow: {
          'from': { 
            boxShadow: '0 0 20px rgba(45, 212, 255, 0.3), 0 0 40px rgba(45, 212, 255, 0.2)' 
          },
          'to': { 
            boxShadow: '0 0 30px rgba(158, 107, 255, 0.4), 0 0 60px rgba(158, 107, 255, 0.3)' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-neon': {
          '0%, 100%': { 
            opacity: '1',
            filter: 'brightness(1) drop-shadow(0 0 10px rgba(45, 212, 255, 0.5))'
          },
          '50%': { 
            opacity: '0.8',
            filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(45, 212, 255, 0.8))'
          }
        },
        slideIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      boxShadow: {
        'neon': '0 0 30px rgba(45, 212, 255, 0.3)',
        'neon-intense': '0 0 50px rgba(158, 107, 255, 0.5)',
        'glow-white': '0 0 40px rgba(255, 255, 255, 0.3)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.4)',
        'burgundy-glow': '0 0 40px rgba(107, 27, 61, 0.3)'
      },
      backgroundImage: {
        'gradient-holographic': 'linear-gradient(135deg, #2DD4FF 0%, #9E6BFF 50%, #FF8CF7 100%)',
        'gradient-radial': 'radial-gradient(circle at center, rgba(45, 212, 255, 0.1) 0%, transparent 70%)',
        'grid-pattern': 'repeating-linear-gradient(90deg, transparent 0, rgba(45, 212, 255, 0.05) 1px, transparent 2px, transparent 100px), repeating-linear-gradient(0deg, transparent 0, rgba(45, 212, 255, 0.05) 1px, transparent 2px, transparent 100px)',
        'gradient-burgundy': 'linear-gradient(135deg, #6B1B3D 0%, #4A0E2A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
        'gradient-royal': 'linear-gradient(135deg, #4A0E2A 0%, #6B1B3D 50%, #D4AF37 100%)'
      }
    },
  },
  plugins: [],
}
