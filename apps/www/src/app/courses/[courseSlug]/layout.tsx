import { Suspense } from "react";
import { AppServerLayoutEntrypoint } from "@/components/AppPage";
import { Skeleton } from "@/components/Skeleton";
import { getCourseOutline } from "./getCourseOutline";
import { paramsTemplate } from "./paramsTemplate";
import { CourseTitleLink, DrillLink, LessonLink } from "./SideNavLink";

// Every course, lesson, and drill is prerendered via generateStaticParams.
export const ensureStatic = "navigation";

export default AppServerLayoutEntrypoint(({ children, params }) => {
  return (
    <div className="flex grow items-stretch">
      <div className="hidden w-64 shrink-0 flex-col gap-2 border-black border-r lg:flex">
        <Suspense fallback={<SideNavSkeleton />}>
          <SideNav params={params} />
        </Suspense>
      </div>
      <div className="flex grow flex-col px-3 pt-1 pb-3">{children}</div>
    </div>
  );
});

async function SideNav({ params }: { params: Promise<Record<string, unknown>> }) {
  const { courseSlug } = paramsTemplate.parse(await params);
  const course = await getCourseOutline(courseSlug);
  return (
    <>
      <CourseTitleLink courseSlug={course.slug}>{course.title}</CourseTitleLink>
      {course.Lesson.map((lesson) => (
        <div className="flex flex-col" key={lesson.title}>
          <LessonLink courseSlug={courseSlug} lessonSlug={lesson.slug} title={lesson.title} />
          <ol className="flex flex-col">
            {lesson.Drill.map((drill) => (
              <li key={drill.slug}>
                <DrillLink
                  courseSlug={courseSlug}
                  lessonSlug={lesson.slug}
                  drillSlug={drill.slug}
                  title={drill.title}
                />
              </li>
            ))}
            <li>
              <DrillLink
                courseSlug={courseSlug}
                lessonSlug={lesson.slug}
                drillSlug={`final-mastery-${lesson.slug}`}
                title="Final Mastery"
              />
            </li>
          </ol>
        </div>
      ))}
    </>
  );
}

function SideNavSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-2">
      <Skeleton className="h-7 w-3/4" />
      {[0, 1, 2].map((group) => (
        <div className="flex flex-col gap-2" key={group}>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ))}
    </div>
  );
}
