import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        paper: "#f7f5ef",
        mint: "#2fbf8f",
        coral: "#f26d5b",
        violet: "#6254d9"
      },
      fontFamily: {
        display: ["var(--font-display)", "Segoe UI", "sans-serif"],
        sans: ["var(--font-body)", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 33, 43, 0.12)"
      },
      keyframes: {
        "home-rise": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "home-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        }
      },
      animation: {
        "home-rise": "home-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "home-rise-delayed": "home-rise 800ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "home-fade": "home-fade 900ms 180ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
