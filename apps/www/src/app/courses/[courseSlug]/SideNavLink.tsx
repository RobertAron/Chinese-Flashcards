"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PracticeCountIcon } from "@/utils/colorMapping";
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
    <Link href={href} className="truncate border-black border-b-1 px-1 py-2 font-bold text-2xl text-black">
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
  return (
    <Link
      data-selected={matchingPath}
      href={`/courses/${courseSlug}/${lessonSlug}/${drillSlug}`}
      key={drillSlug}
      className={`${coreLinkClasses} flex border-[currentColor] border-l pl-1`}
    >
      <div className="flex items-center gap-1 pl-2">
        <PracticeCountIcon count={practiceCount} />
        <span>{title}</span>
      </div>
    </Link>
  );
};
