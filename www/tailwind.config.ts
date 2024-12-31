import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const gridStackPlugin = plugin(({ addUtilities, addVariant }) => {
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
  addVariant("hocus", ["&:hover", "&:focus"]);
});

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [gridStackPlugin],
} satisfies Config;
