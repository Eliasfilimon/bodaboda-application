/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        twende: {
          primary: "#00A651",
          dark: "#007A3D",
          light: "#E6F7EE",
          accent: "#FF6B00",
          text: "#1A1A2E",
          gray: "#6B7280",
          white: "#FFFFFF",
          bg: "#F3F4F6",
        },
        navy: {
          950: "#1A1A2E",
          900: "#1A1A2E",
          800: "#1A1A2E",
        },
        amber: {
          300: "#FFD8BF",
          500: "#FF6B00",
          600: "#E65F00",
          700: "#CC5500",
        },
        sand: {
          50: "#F3F4F6",
          100: "#EEF0F2",
          200: "#E6E9ED",
          300: "#D7DCE2",
          400: "#AAB3BD",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
        },
        savanna: {
          100: "#E6F7EE",
          700: "#007A3D",
        },
        inprogress: "#1D4ED8",
        flame: {
          500: "#E74C3C",
        },
        offline: "#6B7280",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.75rem",
      },
      boxShadow: {
        card: "0 8px 20px rgba(11, 43, 64, 0.08)",
        amber: "0 10px 24px rgba(245, 166, 35, 0.35)",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(900px 500px at 10% -10%, rgba(245, 166, 35, 0.18), transparent 65%), linear-gradient(135deg, #FAF7F2 0%, #F6F0E7 50%, #F9F2E4 100%)",
      },
    },
  },
  plugins: [],
};
