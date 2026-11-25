import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta = {
  title: "Components/TextField",
  component: TextField,
  args: { label: "Search", placeholder: "Characters, pinyin or English" },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: "Matches anywhere in the word." } };
export const Invalid: Story = { args: { isInvalid: true, errorMessage: "Type at least one character." } };
