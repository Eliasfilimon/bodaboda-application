/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A1628",
          900: "#0B2B40",
          800: "#123A55",
        },
        amber: {
          300: "#FFD38A",
          500: "#F5A623",
          600: "#E39115",
          700: "#C57A0E",
        },
        sand: {
          50: "#F7F4EF",
          100: "#F1ECE4",
          200: "#E6DED1",
          300: "#D7CCB9",
          400: "#BDAF99",
          500: "#9A8B78",
          600: "#7A6B58",
          700: "#5A4B38",
        },
        savanna: {
          100: "#E7F5EA",
          700: "#1E7A3E",
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
