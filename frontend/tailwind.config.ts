import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0C11",
          50: "#F3F1EA",
        },
        surface: {
          DEFAULT: "#13151C",
          2: "#191C25",
          3: "#20232E",
        },
        border: "#262A35",
        "border-soft": "#1D2029",
        paper: "#F4F2EC",
        muted: "#8B90A0",
        "muted-2": "#5C6072",
        ember: {
          DEFAULT: "#FF6B45",
          soft: "#3A241C",
          hover: "#FF7F5E",
        },
        periwinkle: {
          DEFAULT: "#7C93FF",
          soft: "#1F2440",
        },
        success: "#5FD98A",
        danger: "#F2585F",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "22px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 30px -14px rgba(0,0,0,0.55)",
        pop: "0 20px 60px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
