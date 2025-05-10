"use client";
import { Link } from "@/utils/NextNavigationUtils";
import { useTailwindOverride } from "@/utils/styleResolvers";
import { usePathname } from "next/navigation";

type LessonLinkProps = {
  courseSlug: string;
  lessonSlug: string;
  title: string;
  children?: React.ReactNode;
};

const coreLinkClasses = "text-gray-600 truncate hocus:text-black";
const selectedLinkClasses = "text-gray-800 font-bold";

type CourseTitleLinkProps = {
  courseSlug: string;
  children?: React.ReactNode;
};
export const CourseTitleLink = ({ courseSlug, children }: CourseTitleLinkProps) => {
  const href = `/courses/${courseSlug}`;
  const classes = useTailwindOverride(
    coreLinkClasses,
    selectedLinkClasses,
    "truncate border-black border-gray-400 border-b-1 px-1 py-2 text-2xl",
  );

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
};

export const LessonLink = ({ courseSlug, lessonSlug, title }: LessonLinkProps) => {
  const pathname = usePathname();
  const href = `/courses/${courseSlug}/${lessonSlug}`;
  const matchingPath = pathname.startsWith(href);
  const classes = useTailwindOverride(coreLinkClasses, "font-semibold", {
    [selectedLinkClasses]: matchingPath,
  });
  return (
    <Link href={href} className={classes}>
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
  const classes = useTailwindOverride(coreLinkClasses, "border-[currentColor] border-l-[1.5px] pl-2", {
    [selectedLinkClasses]: matchingPath,
  });
  return (
    <Link href={`/courses/${courseSlug}/${lessonSlug}/${drillSlug}`} key={drillSlug} className={classes}>
      <div className="pl-2">{title}</div>
    </Link>
  );
};
