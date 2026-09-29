import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";
import { Skeleton } from "@/components/Skeleton";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { PracticeCountCell, TimeAttackCell } from "./client";
import { generateStaticParams } from "./generateStaticParams";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };

async function getLesson(lessonSlug: string) {
  "use cache";
  cacheLife("max");
  return getPrismaClient().lesson.findFirst({
    where: {
      slug: lessonSlug,
    },
    select: {
      title: true,
      Drill: {
        orderBy: {
          order: "asc",
        },
      },
      Course: {
        select: {
          title: true,
        },
      },
    },
  });
}

export default AppServerPageEntrypoint(({ params }) => {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonDrills params={params} />
    </Suspense>
  );
});

async function LessonDrills({ params }: { params: Promise<Record<string, unknown>> }) {
  const { lessonSlug, courseSlug } = paramsTemplate.parse(await params);
  const lesson = await getLesson(lessonSlug);
  if (lesson == null) notFound();
  return (
    <>
      <BreadcrumbContainer>
        <Breadcrumb href="/courses">Courses</Breadcrumb>
        <BreadcrumbEscape href={`/courses/${courseSlug}`}>{lesson.Course.title}</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col gap-4">
        <h1 className="font-bold text-5xl underline">{lesson.title}</h1>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-3 grid grid-cols-subgrid">
            <div>Drill</div>
            <div className="text-end">Practice</div>
            <div className="text-end">Speedrun</div>
          </div>
          {lesson.Drill.map((ele) => (
            <MotionLink
              initial={{ opacity: 0, scaleY: 1.02 }}
              animate={{ opacity: 1, scaleY: 1 }}
              className={`col-span-3 grid hocus:scale-[102%] pressed:scale-[102%] grid-cols-subgrid transition-[scale] duration-100 ${buttonBehaviorClasses}`}
              href={`/courses/${courseSlug}/${lessonSlug}/${ele.slug}`}
              key={ele.slug}
            >
              <div>{ele.title}</div>
              <PracticeCountCell challengeId={ele.slug} />
              <TimeAttackCell challengeId={ele.slug} />
            </MotionLink>
          ))}
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.02 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className={`col-span-3 grid hocus:scale-[102%] pressed:scale-[102%] grid-cols-subgrid transition-[scale] duration-100 ${buttonBehaviorClasses}`}
            href={`/courses/${courseSlug}/${lessonSlug}/final-mastery-${lessonSlug}`}
          >
            <div>Final Mastery 💯</div>
            <PracticeCountCell challengeId={`final-mastery-${lessonSlug}`} />
            <TimeAttackCell challengeId={`final-mastery-${lessonSlug}`} />
          </MotionLink>
        </div>
      </main>
    </>
  );
}

function LessonSkeleton() {
  return (
    <>
      <div className="py-2">
        <Skeleton className="h-6 w-48" />
      </div>
      <main className="flex flex-col gap-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </main>
    </>
  );
}
