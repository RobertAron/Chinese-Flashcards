import type { HskLevel } from "vocab-db/prisma";

const hskClasses: Record<HskLevel, string> = {
  hsk1: "bg-teal-300 text-black",
  hsk2: "bg-green-300 text-black",
  hsk3: "bg-lime-300 text-black",
  hsk4: "bg-yellow-300 text-black",
  hsk5: "bg-orange-300 text-black",
  hsk6: "bg-red-300 text-black",
  hsk7: "bg-red-400 text-black",
};
export function HskBadge({ hskLevel }: { hskLevel: HskLevel }) {
  return (
    <div className={`${hskClasses[hskLevel]} p-1 px-2 border border-black rounded-full text-xs text-center`}>
      {hskLevel}
    </div>
  );
}
