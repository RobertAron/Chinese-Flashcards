import type { StorybookConfig } from "@storybook/nextjs";

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    {
      name: getAbsolutePath("@storybook/addon-essentials"),
      options: {
        docs: false,
      },
    },
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: "@storybook/nextjs",
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
