import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { HskFilter, type HskFilterLevel, hskFilterLevels } from "./HskFilter";
import { MotionProvider } from "./MotionProvider";

function StatefulHskFilter({ initialSelected }: { initialSelected: HskFilterLevel[] }) {
  const [selected, setSelected] = useState<ReadonlySet<HskFilterLevel>>(new Set(initialSelected));
  return (
    <div className="flex flex-col gap-4">
      <HskFilter selected={selected} onChange={setSelected} />
      <p className="text-sm text-gray-600">
        Showing: {hskFilterLevels.filter((level) => selected.has(level)).join(", ") || "nothing"}
      </p>
    </div>
  );
}

const meta = {
  title: "Components/HskFilter",
  component: StatefulHskFilter,
  decorators: [
    (Story) => (
      <MotionProvider>
        <Story />
      </MotionProvider>
    ),
  ],
} satisfies Meta<typeof StatefulHskFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSelected: Story = { args: { initialSelected: [...hskFilterLevels] } };
export const OneSelected: Story = { args: { initialSelected: ["hsk3"] } };
export const NoneSelected: Story = { args: { initialSelected: [] } };
