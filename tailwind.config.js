/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ===== COOL-TONE MODERN MODE =====
        twende: {
          background: '#F8FAFC',
          surface: '#FFFFFF',
          
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-light': 'rgba(37, 99, 235, 0.1)',

          brand: '#7C3AED',
          'brand-hover': '#6D28D9',
          'brand-light': 'rgba(124, 58, 237, 0.1)',
          
          success: '#22C55E',
          'success-hover': '#16A34A',
          
          text: '#0F172A',
          'text-secondary': '#64748B',
          border: '#DCE3F0',
          
          accent: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB',
          
          // Legacy mappings to prevent immediate breakage
          navy: '#F8FAFC',
          'navy-light': '#FFFFFF',
          orange: '#2563EB',
          'orange-hover': '#1D4ED8',
          'primary-dark': '#1D4ED8',
          'accent-light': 'rgba(245, 158, 11, 0.1)',
          light: '#FFFFFF',
          dark: '#0F172A',
          'gray-light': '#DCE3F0',
        },
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 4px 14px 0 rgba(0, 168, 107, 0.2)', // Soft primary shadow
      },
    },
  },
  plugins: [],
};

