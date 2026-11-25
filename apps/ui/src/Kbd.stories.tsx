import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { Kbd } from "./Kbd";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  args: { children: "esc" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Inside a `group` button, the key inverts along with the button on hover, focus and press. */
export const InButton: Story = {
  render: (args) => (
    <Button className="flex items-center gap-2 px-3">
      Skip <Kbd {...args} />
    </Button>
  ),
  args: { children: "s" },
};
