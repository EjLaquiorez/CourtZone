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
        // Single primary accent (orange, Strava-like)
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },

        // Neutral dark surfaces (slate / navy-esque)
        dark: {
          50: '#1F2937',
          100: '#111827',
          200: '#0F172A',
          300: '#020617',
          400: '#020617',
          500: '#020617',
          600: '#020617',
          700: '#020617',
          800: '#020617',
          900: '#020617',
        },

        // Keep court green, but use sparingly (e.g. for W/L badges)
        court: {
          50: '#ECFDF3',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },

        // Status Colors (semantic, minimal usage)
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        info: '#38BDF8',

        status: {
          open: '#22C55E',
          filling: '#EAB308',
          full: '#EF4444',
          yours: '#38BDF8',
        },

        // Layout backgrounds
        surface: {
          light: '#111827',
          dark: '#020617',
        },

        // Legacy support
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
        primary: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        accent: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },

      // Typography scale inspired by golden ratio for dashboard headings
      fontSize: {
        'display-1': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        'display-2': ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        'heading-1': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-2': ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-3': ['1.125rem', { lineHeight: '1.35' }],
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      boxShadow: {
        glow: '0 0 24px rgba(15, 23, 42, 0.9)',
        'card-soft': '0 18px 45px rgba(15, 23, 42, 0.55)',
      },

      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #020617 0%, #020617 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
