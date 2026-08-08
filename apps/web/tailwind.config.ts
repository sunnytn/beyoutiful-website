import type { Config } from 'tailwindcss';

/**
 * BeYoutiful Organics design tokens.
 * Palette: botanical greens, warm creams, clay accent — luxury organic.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f5f0',
          100: '#dfe7db',
          200: '#c2d1ba',
          300: '#9db392',
          400: '#75926a',
          500: '#57764e',
          600: '#435e3c',
          700: '#3d5a3d',
          800: '#2e4530',
          900: '#233524',
          950: '#141f15',
        },
        cream: {
          50: '#fdfcf9',
          100: '#faf7f2',
          200: '#f4efe6',
          300: '#eee5d8',
          400: '#e2d4bf',
          500: '#d2bd9e',
        },
        clay: {
          300: '#e0b394',
          400: '#d29a72',
          500: '#c77b4f',
          600: '#b26440',
          700: '#8f4e33',
        },
        ink: {
          DEFAULT: '#2d2a26',
          soft: '#6b6459',
          faint: '#8a8378',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.18em',
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgb(45 42 38 / 0.10)',
        lift: '0 16px 40px -12px rgb(45 42 38 / 0.18)',
      },
      borderRadius: {
        organic: '1.25rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 1.4s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
