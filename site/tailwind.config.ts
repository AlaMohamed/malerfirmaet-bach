import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette (Malerfirmaet Bach ApS)
        brand: {
          DEFAULT: "#7a9e9a",
          50: "#f1f5f4",
          100: "#dfeae8",
          200: "#c1d6d2",
          300: "#9bbab4",
          400: "#7a9e9a",
          500: "#5a7e7a",
          600: "#456461",
          700: "#395250",
          800: "#314441",
          900: "#293938",
        },
        charcoal: {
          DEFAULT: "#2d3748",
          dark: "#1a202c",
          deep: "#0d1117",
        },
        cream: {
          DEFAULT: "#F7F6F2",
          50: "#FFFFFF",
          100: "#FBFAF7",
          200: "#F7F6F2",
          300: "#F1F0EA",
          400: "#E7E5DC",
        },
        warm: {
          gray: "#718096",
          mid: "#A0AEC0",
          light: "#E2E8F0",
        },
        gold: "#C7A560",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 7vw, 7rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(2.5rem, 6vw, 5.5rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 5vw, 4rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        widest: "0.25em",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 1s ease both",
        "marquee": "marquee 40s linear infinite",
        "kenburns": "kenburns 18s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.0) translate(0, 0)" },
          "100%": { transform: "scale(1.1) translate(-1.5%, -1%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(to right, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.55) 50%, rgba(13,17,23,0.25) 100%)",
        "fade-bottom":
          "linear-gradient(to bottom, transparent 0%, rgba(13,17,23,0.55) 60%, rgba(13,17,23,0.9) 100%)",
        "sage-shimmer":
          "linear-gradient(90deg, transparent 0%, rgba(122,158,154,0.18) 50%, transparent 100%)",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
export default config;
