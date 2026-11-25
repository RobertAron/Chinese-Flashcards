import type { Preview } from "@storybook/react-vite";
import { MotionProvider } from "../src/MotionProvider";
import "./preview.css";

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
      <MotionProvider>
        <div className="font-sans text-black">
          <Story />
        </div>
      </MotionProvider>
    ),
  ],
};

export default preview;
