import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Basketball Orange Primary Colors
        primary: {
          50: '#FFF4ED',   // Very light orange
          100: '#FFE6D5',  // Light orange
          200: '#FFCCAA',  // Medium light orange
          300: '#FFB380',  // Medium orange
          400: '#FF9955',  // Light primary orange
          500: '#FF6B35',  // Primary basketball orange
          600: '#E55A2B',  // Dark orange
          700: '#CC4921',  // Darker orange
          800: '#B33817',  // Very dark orange
          900: '#99270D'   // Darkest orange
        },

        // Deep Navy Dark Colors
        dark: {
          50: '#3A3D47',   // Lightest navy
          100: '#2F3239',  // Light navy
          200: '#25272C',  // Medium light navy
          300: '#1A1D29',  // Primary navy
          400: '#171A25',  // Dark navy
          500: '#141721',  // Darker navy
          600: '#11141D',  // Very dark navy
          700: '#0E1119',  // Deeper navy
          800: '#0B0E15',  // Very deep navy
          900: '#0F1419'   // Darkest navy background
        },

        // Court Green Accent Colors
        court: {
          50: '#F0FDF4',   // Very light green
          100: '#DCFCE7',  // Light green
          200: '#BBF7D0',  // Medium light green
          300: '#86EFAC',  // Medium green
          400: '#4ADE80',  // Light court green
          500: '#228B22',  // Primary court green
          600: '#32CD32',  // Bright court green
          700: '#16A34A',  // Dark green
          800: '#15803D',  // Darker green
          900: '#14532D'   // Darkest green
        },

        // Status Colors
        success: '#32CD32',  // Court green success
        warning: '#FFA500',  // Orange warning
        danger: '#DC2626',   // Red danger
        info: '#3B82F6',     // Blue info

        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      fontFamily: {
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
        'primary': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Orbitron', 'monospace'],
        'accent': ['Rajdhani', 'sans-serif']
      },

      animation: {
        'bounce-ball': 'bounce 1s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },

      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.8)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },

      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 53, 0.5)',
        'glow-lg': '0 0 40px rgba(255, 107, 53, 0.8)',
        'court': '0 4px 6px -1px rgba(34, 139, 34, 0.1)',
        'basketball': '0 8px 25px -5px rgba(255, 107, 53, 0.3)'
      },

      backgroundImage: {
        'court-gradient': 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
        'navy-gradient': 'linear-gradient(135deg, #1A1D29 0%, #0F1419 100%)'
      }
    },
  },
  plugins: [],
} satisfies Config;
