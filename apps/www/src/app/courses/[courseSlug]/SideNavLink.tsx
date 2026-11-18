"use client";
import { usePathname } from "next/navigation";
import { PracticeCountIcon } from "@/utils/colorMapping";
import { Link } from "@/utils/NextNavigationUtils";
import { usePracticeCount } from "@/utils/playerState";

type LessonLinkProps = {
  courseSlug: string;
  lessonSlug: string;
  title: string;
  children?: React.ReactNode;
};

// Whole path segments only, so ".../part-1" isn't selected on ".../part-10" or ".../part-1-words".
const isWithinPath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const coreLinkClasses =
  "text-gray-600 truncate hocus:text-black data-[selected=true]:text-gray-800 data-[selected=true]:font-bold";

type CourseTitleLinkProps = {
  courseSlug: string;
  children?: React.ReactNode;
};
export const CourseTitleLink = ({ courseSlug, children }: CourseTitleLinkProps) => {
  const href = `/courses/${courseSlug}`;
  return (
    <Link href={href} className="truncate border-b border-black px-1 py-2 text-2xl font-bold text-black">
      {children}
    </Link>
  );
};

export const LessonLink = ({ courseSlug, lessonSlug, title }: LessonLinkProps) => {
  const pathname = usePathname();
  const href = `/courses/${courseSlug}/${lessonSlug}`;
  const matchingPath = isWithinPath(pathname, href);
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
  const matchingPath = isWithinPath(pathname, href);
  const [practiceCount] = usePracticeCount(drillSlug);
  return (
    <Link
      data-selected={matchingPath}
      href={`/courses/${courseSlug}/${lessonSlug}/${drillSlug}`}
      key={drillSlug}
      className={`${coreLinkClasses} flex border-l border-[currentColor] pl-1`}
    >
      <div className="flex items-center gap-1 pl-2">
        <PracticeCountIcon count={practiceCount} />
        <span>{title}</span>
      </div>
    </Link>
  );
};
