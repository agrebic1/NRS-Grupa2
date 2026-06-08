import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-teal': 'rgb(var(--first-primary-rgb) / <alpha-value>)',
        'celestial-teal': 'rgb(var(--first-secondary-rgb) / <alpha-value>)',
        'warm-cream': 'rgb(var(--first-tertiary-rgb) / <alpha-value>)',
        'soft-beige': 'rgb(var(--first-quaternary-rgb) / <alpha-value>)',
        'muted-sand': 'rgb(var(--first-quinary-rgb) / <alpha-value>)',
        'mystic-ember': 'rgb(var(--first-senary-rgb) / <alpha-value>)',
        'herbal-gold': 'rgb(var(--first-septenary-rgb) / <alpha-value>)',
        'text-main': 'rgb(var(--first-octonary-rgb) / <alpha-value>)',
        'text-muted': 'rgb(var(--first-nonary-rgb) / <alpha-value>)',
      },
      keyframes: {
        'spin-gear': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-gear-reverse': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'spin-gear': 'spin-gear 2s linear infinite',
        'spin-gear-reverse': 'spin-gear-reverse 1.4s linear infinite',
        float: 'float 3.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.35s ease-out both',
        'slide-right': 'slide-right 0.35s ease-out both',
      },
      boxShadow: {
        card: '0 4px 24px rgb(var(--first-primary-rgb) / 0.10)',
        'card-lg': '0 8px 40px rgb(var(--first-primary-rgb) / 0.14)',
        glow: '0 0 0 3px rgb(var(--first-secondary-rgb) / 0.20)',
      },
    },
  },
  plugins: [],
};

export default config;
