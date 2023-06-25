/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3D57DF',
          off_blue: '#6680DB',
          light_blue: '#A5BAD8',
          grey: '#4F4C4C',
          black: '#1F1E1E',
        },
        gradient: {
          start: "#EAABF0",
          end: "#4623E9"
        },
        error: {
          light: '#F04855',
          dark: '#fc3847',
        },
        warning: {
          light: '#f88830',
          dark: '#f26f08',
        },
        success: {
          light: '#68C86C',
          dark: '#54cc59',
        },
        white: '#ffffff',
        transparent: 'transparent',
        current: 'currentColor',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
