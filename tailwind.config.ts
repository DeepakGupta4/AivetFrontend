import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lime:       "#C9F31D",
        "lime-dark":"#A8D017",
        "dark-base":"#0E0F11",
        "near-black":"#04000B",
        success:    "#22C55E",
        warning:    "#F59E0B",
        error:      "#EF4444",
        chatgpt:    "#10A37F",
        claude:     "#D97757",
        gemini:     "#1A73E8",
        perplexity: "#22B8CF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-left": "slideInLeft 0.3s ease forwards",
        "pulse-lime": "pulseLime 2s infinite",
        shimmer:      "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        pulseLime: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,243,29,0.4)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(201,243,29,0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "lime-gradient": "linear-gradient(135deg, #C9F31D, #A8D017)",
      },
    },
  },
  plugins: [],
};

export default config;
