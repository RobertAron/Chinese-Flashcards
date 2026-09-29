import { Suspense } from "react";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";
import { Skeleton } from "@/components/Skeleton";
import { LessonProgress } from "./client";
import { generateStaticParams } from "./generateStaticParams";
import { getCourseOutline } from "./getCourseOutline";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };
export default AppServerPageEntrypoint(({ params }) => {
  return (
    <>
      <BreadcrumbContainer>
        <BreadcrumbEscape href="/courses">Courses</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col gap-4">
        <Suspense fallback={<CourseSkeleton />}>
          <CourseLessons params={params} />
        </Suspense>
      </main>
    </>
  );
});

async function CourseLessons({ params }: { params: Promise<Record<string, unknown>> }) {
  const { courseSlug } = paramsTemplate.parse(await params);
  const course = await getCourseOutline(courseSlug);
  return (
    <>
      <h1 className="font-bold text-5xl underline">{course.title}</h1>
      <div className="grid grid-cols-3 gap-1">
        {course.Lesson.map((ele) => (
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.02 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className={`col-span-3 grid hocus:scale-[102%] pressed:scale-[102%] grid-cols-subgrid transition-[scale] duration-100 ${buttonBehaviorClasses}`}
            href={`/courses/${courseSlug}/${ele.slug}`}
            key={ele.slug}
          >
            <div className="col-span-2">{ele.title}</div>
            <LessonProgress drillSlugs={[...ele.Drill.map((ele) => ele.slug), `final-mastery-${ele.slug}`]} />
          </MotionLink>
        ))}
      </div>
    </>
  );
}

function CourseSkeleton() {
  return (
    <>
      <Skeleton className="h-12 w-1/2" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </>
  );
}
