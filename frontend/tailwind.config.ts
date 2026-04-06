import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Apple-inspired neutral palette
        surface: {
          primary: "#ffffff",
          secondary: "#f5f5f7",
          tertiary: "#fbfbfd",
        },
        text: {
          primary: "#1d1d1f",
          secondary: "#6e6e73",
          tertiary: "#86868b",
        },
        accent: {
          blue: "#0071e3",
          "blue-hover": "#0077ed",
          green: "#34c759",
          red: "#ff3b30",
          orange: "#ff9500",
          yellow: "#ffcc00",
        },
        // Trust level border colors
        trust: {
          top: "#34c759",     // Green - top tier
          high: "#0071e3",    // Blue - high
          mid: "#ff9500",     // Orange - mid
          low: "#ff3b30",     // Red - low
          none: "#d2d2d7",    // Gray - unranked
        },
        border: {
          primary: "#d2d2d7",
          secondary: "#e8e8ed",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Pretendard",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Pretendard",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-lg": ["56px", { lineHeight: "1.07", letterSpacing: "-0.005em", fontWeight: "600" }],
        "display": ["48px", { lineHeight: "1.08", letterSpacing: "-0.003em", fontWeight: "600" }],
        "display-sm": ["40px", { lineHeight: "1.1", letterSpacing: "-0.002em", fontWeight: "600" }],
        "headline": ["28px", { lineHeight: "1.14", letterSpacing: "0.007em", fontWeight: "600" }],
        "title": ["21px", { lineHeight: "1.19", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "1.47", fontWeight: "400" }],
        "body": ["14px", { lineHeight: "1.43", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "1.33", fontWeight: "400" }],
      },
      borderRadius: {
        "apple": "12px",
        "apple-lg": "18px",
        "apple-xl": "22px",
      },
      boxShadow: {
        "apple": "0 2px 8px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.06)",
        "apple-md": "0 4px 16px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)",
        "apple-lg": "0 8px 32px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
