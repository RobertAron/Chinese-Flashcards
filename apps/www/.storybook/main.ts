import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: getAbsolutePath("@storybook/nextjs"),
  staticDirs: [
    "../public",
    {
      from: "../../../node_modules/geist/dist/fonts/geist-sans",
      to: "/fonts/geist-sans",
    },
    {
      from: "../../../node_modules/geist/dist/fonts/geist-mono",
      to: "/fonts/geist-mono",
    },
  ],
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
