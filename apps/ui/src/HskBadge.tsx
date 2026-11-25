import { type HskLevel, hskClasses } from "./hsk";

export function HskBadge({ hskLevel }: { hskLevel: HskLevel }) {
  return (
    <div className={`${hskClasses[hskLevel]} rounded-full border border-black p-1 px-2 text-center text-xs`}>
      {hskLevel}
    </div>
  );
}
