"use client";
import { Button } from "react-aria-components";
import type { HskLevel } from "vocab-db/prisma";
import { cn } from "@/utils/cn";
import { Checkbox } from "./Checkbox";
import { hskClasses } from "./HskBadge";

/** "none" covers words that aren't on any HSK list. */
export type HskFilterLevel = HskLevel | "none";

export const hskFilterLevels: readonly HskFilterLevel[] = [
  "hsk1",
  "hsk2",
  "hsk3",
  "hsk4",
  "hsk5",
  "hsk6",
  "hsk7",
  "none",
];

const levelClasses: Record<HskFilterLevel, string> = { ...hskClasses, none: "bg-gray-200 text-black" };
const levelLabels: Record<HskFilterLevel, string> = {
  hsk1: "HSK 1",
  hsk2: "HSK 2",
  hsk3: "HSK 3",
  hsk4: "HSK 4",
  hsk5: "HSK 5",
  hsk6: "HSK 6",
  hsk7: "HSK 7",
  none: "No HSK",
};

/**
 * Works like a "solo" button in a DAW: soloing the only selected level brings every level back,
 * otherwise the selection collapses to just that level.
 */
export function soloHskLevel(selected: ReadonlySet<HskFilterLevel>, level: HskFilterLevel) {
  const isAlreadySoloed = selected.size === 1 && selected.has(level);
  return new Set(isAlreadySoloed ? hskFilterLevels : [level]);
}

export function toggleHskLevel(selected: ReadonlySet<HskFilterLevel>, level: HskFilterLevel) {
  const next = new Set(selected);
  if (!next.delete(level)) next.add(level);
  return next;
}

export function HskFilter({
  selected,
  onChange,
  className,
}: {
  selected: ReadonlySet<HskFilterLevel>;
  onChange: (selected: Set<HskFilterLevel>) => void;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-wrap gap-2", className)}>
      <legend className="sr-only">Filter by HSK level</legend>
      {hskFilterLevels.map((level) => (
        <div key={level} className="relative flex items-center gap-2 p-1.25 pr-3 text-sm">
          {/* The solo button fills the whole chip; the checkbox sits on top of it so it can be clicked on its own.
              Its radius is the checkbox's 6px plus the 4px gap and 1px border, so the corners stay concentric. */}
          <Button
            aria-label={`Solo ${levelLabels[level]}`}
            onPress={() => onChange(soloHskLevel(selected, level))}
            className={cn(
              "hocus:ring-2 hocus:ring-black pressed:ring-2 pressed:ring-black pressed:brightness-90 absolute inset-0 rounded-[11px] border border-black outline-none",
              levelClasses[level],
            )}
          />
          <Checkbox
            className="group relative flex rounded-md bg-white"
            aria-label={`Show ${levelLabels[level]}`}
            isSelected={selected.has(level)}
            onChange={() => onChange(toggleHskLevel(selected, level))}
          />
          <span className="pointer-events-none relative font-medium">{levelLabels[level]}</span>
        </div>
      ))}
    </fieldset>
  );
}
