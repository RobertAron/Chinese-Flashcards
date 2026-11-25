import type { Meta, StoryObj } from "@storybook/react-vite";
import { HskBadge } from "./HskBadge";
import { hskLevels } from "./hsk";

const meta = {
  title: "Components/HskBadge",
  component: HskBadge,
  args: { hskLevel: "hsk1" },
  argTypes: { hskLevel: { control: "select", options: hskLevels } },
} satisfies Meta<typeof HskBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllLevels: Story = {
  render: () => (
    <div className="flex gap-2">
      {hskLevels.map((level) => (
        <HskBadge key={level} hskLevel={level} />
      ))}
    </div>
  ),
};
