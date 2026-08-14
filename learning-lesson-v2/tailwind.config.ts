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
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "home-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "home-orb": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(24px, -18px, 0) scale(1.08)" }
        },
        "home-orb-alt": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-28px, 16px, 0) scale(1.06)" }
        },
        "home-spark": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" }
        },
        "home-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "home-brand-in": {
          from: { opacity: "0", transform: "translateY(18px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "home-brand-glow": {
          "0%, 100%": { textShadow: "0 0 0 rgba(47, 191, 143, 0)" },
          "50%": { textShadow: "0 0 28px rgba(47, 191, 143, 0.35)" }
        },
        "home-card-in": {
          from: { opacity: "0", transform: "translateY(32px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "home-rise": "home-rise 900ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "home-float": "home-float 7s ease-in-out infinite",
        "home-orb": "home-orb 14s ease-in-out infinite",
        "home-orb-alt": "home-orb-alt 18s ease-in-out infinite",
        "home-spark": "home-spark 2.4s ease-in-out infinite",
        "home-fade": "home-fade 500ms ease both",
        "home-brand-in": "home-brand-in 1100ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "home-brand-glow": "home-brand-glow 3.6s 1.1s ease-in-out infinite",
        "home-card-in": "home-card-in 800ms cubic-bezier(0.22, 1, 0.36, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
