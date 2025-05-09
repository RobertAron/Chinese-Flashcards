import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const gridStackPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    ".grid-stack": {
      display: "grid",
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr",
    },
    ".grid-stack-item": {
      gridColumn: "1 / 2",
      gridRow: "1 / 2",
    },
    ".decoration-skip-ink-none": {
      textDecorationSkipInk: "none",
    },
    ".text-pretty": {
      textWrap: "pretty",
    },
  });
});

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "480px",
        md: "640px",
        lg: "768px",
        xl: "1024px",
        "2xl": "1280px",
      },
    },
  },
  plugins: [gridStackPlugin],
} satisfies Config;
