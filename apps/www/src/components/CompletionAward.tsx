import type { AwardTypes } from "@/utils/playerState";
import { Award } from "lucide-react";

export const awardColors = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};
export function PlayerAwardIcon({
  awardType,
  ...restProps
}: {
  awardType: AwardTypes;
} & Omit<React.ComponentProps<typeof Award>, "color">) {
  if (awardType === null) return null;
  return <Award strokeWidth={3} style={{ color: awardColors[awardType] }} {...restProps} />;
}
