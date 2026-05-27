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
      boxShadow: {
        soft: "0 18px 55px rgba(23, 33, 43, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
