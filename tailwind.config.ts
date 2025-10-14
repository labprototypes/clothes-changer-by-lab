import type { Config } from 'tailwindcss'

export default {
  content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C6F36B", // лаймовый акцент
        ink: "#111213",
        soft: "#f5f6f7"
      },
      borderRadius: {
        xl: "14px",
        '2xl': "20px"
      },
      boxShadow: {
        card: "0 2px 10px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
} satisfies Config
