// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from "react";
import localFont from "next/font/local";
import type { Preview } from "@storybook/nextjs";
import '../src/app/globals.css'

const GeistSans = localFont({
  src: "../fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
});

const GeistMono = localFont({
  src: "../fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className={`font-sans ${GeistMono.variable} ${GeistSans.variable}`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;