import { cubicBezier } from "motion";
import {
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";
import { practiceCountColors } from "@/utils/colorMapping";

export function Experience({ percent }: { percent: number }) {
  const experience = useMotionValue(percent);

  useEffect(() => {
    animate(experience, percent, {
      duration: 0.3,
      ease: cubicBezier(0.85, 0, 0.15, 1),
    });
  }, [experience, percent]);
  return (
    <motion.div className="flex [&>*+*]:border-l-0">
      {Object.entries(practiceCountColors).map(([key, val]) => (
        <ExperienceArea
          key={key}
          experience={experience}
          min={val.min === 1 ? 0 : val.min}
          max={val.max}
          bgClassName={val.background}
          filledClassName={val.primary}
        />
      ))}
    </motion.div>
  );
}

function inRange(min: number, max: number, value: number) {
  return min <= value && value < max;
}

function ExperienceArea({
  experience,
  min,
  max,
  bgClassName: bgColor,
  filledClassName: filledColor,
  final,
}: {
  experience: MotionValue<number>;
  min: number;
  max: number;
  bgClassName: string;
  filledClassName: string;
  final?: boolean;
}) {
  const bar1 = useTransform(experience, [min, max], ["0", "100%"]);
  const [isCurrentSection, setInRange] = useState(inRange(min, max, experience.get()));
  useMotionValueEvent(experience, "change", (exp) => {
    const inRangeOfThisSection = final ? exp > min : inRange(min, max, exp);
    if (inRangeOfThisSection !== isCurrentSection) setInRange(inRangeOfThisSection);
  });
  return (
    <motion.div
      className={`flex h-4 min-w-2 basis-1 border-2 border-black ${bgColor}`}
      animate={{ flexGrow: isCurrentSection ? 1 : 0 }}
      transition={{ duration: 0.1, delay: 0.1 }}
    >
      <motion.div className={`h-full ${filledColor}`} style={{ width: bar1 }} />
    </motion.div>
  );
}
