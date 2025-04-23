import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const gridStackPlugin = plugin(({ addUtilities, addVariant, matchUtilities, theme }) => {
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
  addVariant("hocus", ["&:hover", "&:focus-visible"]);
  addVariant("group-hocus", [":merge(.group):hover &", ":merge(.group):focus-visible &"]);
  matchUtilities(
    {
      "text-shadow": (value) => ({
        textShadow: value,
      }),
    },
    { values: theme("textShadow") },
  );
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
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 8px 16px var(--tw-shadow-color)",
      },
    },
    container: {
      center: true,
      padding: "1rem", // Adjust padding as needed
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
