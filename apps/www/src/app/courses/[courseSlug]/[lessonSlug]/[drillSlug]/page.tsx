import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DrillHome } from "./client";
import { getDrillInfo } from "./getDrillInfo";

export const paramsTemplate = z.object({
  drillSlug: z.string(),
  lessonSlug: z.string(),
  courseSlug: z.string(),
});
export type ParamsShape = z.infer<typeof paramsTemplate>;
export async function generateStaticParams(): Promise<ParamsShape[]> {
  const lessons = await getPrismaClient().lesson.findMany({
    select: {
      slug: true,
      courseSlug: true,
      drills: {
        select: {
          slug: true,
        },
      },
    },
  });
  const params = lessons.flatMap((lesson) => [
    {
      courseSlug: lesson.courseSlug,
      lessonSlug: lesson.slug,
      drillSlug: "final-mastery",
    },
    ...lesson.drills.map(
      (drill): ParamsShape => ({
        courseSlug: lesson.courseSlug,
        lessonSlug: lesson.slug,
        drillSlug: drill.slug,
      }),
    ),
  ]);
  return [...params];
}

export default AppServerPageEntrypoint(async ({ params }) => {
  const parsedParams = paramsTemplate.parse(await params);
  const { courseSlug, lessonSlug } = parsedParams;
  const drillInfo = await getDrillInfo(parsedParams);
  if (drillInfo === null) notFound();
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
        <h1 className="font-bold text-3xl underline">{drillInfo.drillTitle}</h1>
        <DrillHome />
      </main>
    </>
  );
});
