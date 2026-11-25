import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#05080f",
        panel: "#0a1222",
        line: "rgba(120, 255, 220, 0.08)",
        accent: "#2ee6a6",
        violet: "#a78bfa",
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
        glow: "0 0 18px rgba(46, 230, 166, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
