import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { getDrillInfo } from "@/components/challenges/challengeServerUtils";
import { Skeleton } from "@/components/Skeleton";
import { DrillHome } from "./client";
import { generateStaticParams } from "./generateStaticParams";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };
export default AppServerPageEntrypoint(({ params }) => {
  return (
    <Suspense fallback={<DrillHomeSkeleton />}>
      <DrillHomeContent params={params} />
    </Suspense>
  );
});

async function DrillHomeContent({ params }: { params: Promise<Record<string, unknown>> }) {
  const parsedParams = paramsTemplate.parse(await params);
  const { courseSlug, lessonSlug } = parsedParams;
  const drillInfo = await getDrillInfo(parsedParams);
  if (drillInfo === null || (drillInfo.phrases.length === 0 && drillInfo.words.length === 0)) notFound();
  return (
    <>
      <BreadcrumbContainer>
        <Breadcrumb href="/courses">Courses</Breadcrumb>
        <Breadcrumb href={`/courses/${courseSlug}`}>{drillInfo.courseTitle}</Breadcrumb>
        <BreadcrumbEscape href={`/courses/${courseSlug}/${lessonSlug}`}>
          {drillInfo.lessonTitle}
        </BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col items-start gap-4">
        <h1 className="font-bold text-5xl underline">{drillInfo.drillTitle}</h1>
        <DrillHome />
      </main>
    </>
  );
}

function DrillHomeSkeleton() {
  return (
    <>
      <div className="py-2">
        <Skeleton className="h-6 w-64" />
      </div>
      <main className="flex flex-col items-start gap-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </main>
    </>
  );
}
