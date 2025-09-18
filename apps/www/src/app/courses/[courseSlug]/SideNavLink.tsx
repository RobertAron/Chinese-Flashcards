"use client";
import { Crown, Squircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { practiceCountToColor } from "@/utils/colorMapping";
import { usePracticeCount } from "@/utils/playerState";

type LessonLinkProps = {
  courseSlug: string;
  lessonSlug: string;
  title: string;
  children?: React.ReactNode;
};

const coreLinkClasses =
  "text-gray-600 truncate hocus:text-black data-[selected=true]:text-gray-800 data-[selected=true]:font-bold";

type CourseTitleLinkProps = {
  courseSlug: string;
  children?: React.ReactNode;
};
export const CourseTitleLink = ({ courseSlug, children }: CourseTitleLinkProps) => {
  const href = `/courses/${courseSlug}`;
  return (
    <Link href={href} className="px-1 py-2 text-2xl font-bold text-black truncate border-black border-b-1">
      {children}
    </Link>
  );
};

export const LessonLink = ({ courseSlug, lessonSlug, title }: LessonLinkProps) => {
  const pathname = usePathname();
  const href = `/courses/${courseSlug}/${lessonSlug}`;
  const matchingPath = pathname.startsWith(href);
  return (
    <Link data-selected={matchingPath} href={href} className={`${coreLinkClasses} font-semibold`}>
      {title}
    </Link>
  );
};

type DrillLinkProps = {
  courseSlug: string;
  lessonSlug: string;
  drillSlug: string;
  title: string;
  children?: React.ReactNode;
};

export const DrillLink = ({ courseSlug, lessonSlug, drillSlug, title }: DrillLinkProps) => {
  const pathname = usePathname();
  const href = `/courses/${courseSlug}/${lessonSlug}/${drillSlug}`;
  const matchingPath = pathname.startsWith(href);
  const [practiceCount] = usePracticeCount(drillSlug);
  const className = practiceCountToColor(practiceCount).font;
  return (
    <Link
      data-selected={matchingPath}
      href={`/courses/${courseSlug}/${lessonSlug}/${drillSlug}`}
      key={drillSlug}
      className={`${coreLinkClasses} flex border-[currentColor] border-l pl-1`}
    >
      <div className="flex items-center pl-2 gap-1">
        {practiceCount === 0 ? (
          <Squircle strokeWidth={3} className="w-4 h-4 text-gray-600" />
        ) : (
          <Crown strokeWidth={3} className={`${className} h-4 w-4`} />
        )}
        <span>{title}</span>
      </div>
    </Link>
  );
};
