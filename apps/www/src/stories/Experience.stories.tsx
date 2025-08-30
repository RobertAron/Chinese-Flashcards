import type { Meta } from "@storybook/react";
import { Experience } from "@/components/Experience";

type PageData = Meta<typeof Wrapper>;

type WrapperProps = {
  percent: number;
};

function Wrapper({ percent }: WrapperProps) {
  return (
    <div className="w-full">
      <Experience percent={percent} />
    </div>
  );
}

export default {
  title: "Exp/Slider",
  component: Wrapper,
  argTypes: {
    percent: {
      type: "number",
    },
  },
  args: {
    percent: 0,
  },
} satisfies PageData;

export const Main = {};
