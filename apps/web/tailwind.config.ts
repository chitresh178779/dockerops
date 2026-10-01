import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        surface: "#080808",
        surfaceRaised: "#111215",
        surfaceHover: "#181a1f",
        line: "#262626",
        lineLight: "#383838",
        paper: "#ffffff",
        paperDim: "#8e8e93",
        acid: "#00ff66",
        acidDim: "#05cc55",
        acidGlow: "rgba(0, 255, 102, 0.25)",
        volt: "#e2ff32",
        voltHover: "#d4ff00",
        incident: "#ff3333",
        incidentDim: "#e02828",
        incidentGlow: "rgba(255, 51, 51, 0.25)",
        warn: "#ffcc00",
        info: "#38bdf8",
        cream: "#f5f0e6",
        creamSurface: "#ece6d8",
        creamText: "#000000",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "Consolas", "SFMono-Regular", "Menlo", "monospace"],
        display: ["'Chakra Petch'", "'Space Grotesk'", "Arial Black", "Helvetica Neue", "Impact", "sans-serif"],
        sans: ["'Space Grotesk'", "Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "1px",
        DEFAULT: "2px",
        md: "2px",
        lg: "3px",
        xl: "4px",
        full: "9999px",
      },
      borderWidth: {
        DEFAULT: "1px",
        1: "1px",
        2: "2px",
      },
      boxShadow: {
        hard: "3px 3px 0 0 #000",
        glowAcid: "0 0 20px 2px rgba(0, 255, 102, 0.25)",
        glowIncident: "0 0 20px 2px rgba(255, 51, 51, 0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-fade-in": "slide-fade-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-left": "slide-in-left 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "page-enter": "page-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
