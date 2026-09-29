"use client";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";

export function ModeOption({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
}) {
  return (
    <MotionLink
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.1,
      }}
      href={href}
      className={`group flex shrink grow hocus:rotate-1 pressed:rotate-1 hocus:scale-[102%] pressed:scale-[102%] items-center gap-4 p-3 transition-[scale,rotate] duration-100 hover:z-10 ${buttonBehaviorClasses}`}
    >
      <div className="h-20 w-20 shrink-0 rounded-full bg-black p-2 text-white group-hocus:bg-white group-pressed:bg-white group-hocus:text-black group-pressed:text-black sm:h-28 sm:w-28 md:p-4">
        {icon}
      </div>
      <div className="w-0 grow">
        <div className="truncate whitespace-nowrap text-5xl sm:text-6xl">{title}</div>
        <div className="truncate whitespace-nowrap text-2xl sm:text-4xl">{subtitle}</div>
      </div>
    </MotionLink>
  );
}
