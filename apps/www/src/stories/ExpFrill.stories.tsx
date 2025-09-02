import type { Meta } from "@storybook/react";
import { Button } from "@/components/Button";
import { ExpFrillProvider, FrillContainer, useExpFrills } from "@/components/ExpFrill";

type PageData = Meta<typeof Wrapper>;

type WrapperProps = Record<string, never>;

function Wrapper(_: WrapperProps) {
  return (
    <div className="flex items-center justify-center h-full p-10">
      <div className="relative flex flex-col gap-10">
        <ExpFrillProvider>
          <AddFrillButton />
          <FrillContainer>
            <div className="relative p-2 bg-white border border-black">Some content</div>
          </FrillContainer>
        </ExpFrillProvider>
      </div>
    </div>
  );
}
function AddFrillButton() {
  const { pushFrill } = useExpFrills();
  return <Button onClick={pushFrill}>Do Frill</Button>;
}

export default {
  title: "Exp/Frill",
  component: Wrapper,
  argTypes: {
    // content: {
    //   type: "string",
    // },
  },
  args: {
    // content: "",
  },
} satisfies PageData;

export const Main = {};
