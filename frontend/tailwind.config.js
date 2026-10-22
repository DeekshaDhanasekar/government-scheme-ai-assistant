/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0f1a",
          900: "#0f172a",
          800: "#161f34",
          700: "#1e293b",
        },
        brand: {
          500: "#0d9488",
          600: "#0f766e",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "bounce-dot": "bounceDot 1.4s infinite ease-in-out both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.5 },
          "40%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
