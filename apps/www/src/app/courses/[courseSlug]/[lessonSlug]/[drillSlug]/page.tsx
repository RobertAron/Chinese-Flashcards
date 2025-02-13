import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { z } from "zod";
import { DrillHome } from "./client";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { notFound } from "next/navigation";

export const paramsTemplate = z.object({
  drillSlug: z.string(),
  lessonSlug: z.string(),
  courseSlug: z.string(),
});

export default AppServerPageEntrypoint(async ({ params }) => {
  const { drillSlug, courseSlug, lessonSlug } = paramsTemplate.parse(await params);
  const titles = await getPrismaClient().drill.findUnique({
    where: { slug: drillSlug },
    select: {
      title: true,
      lesson: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
  if (titles === null) notFound();
  return (
    <>
      <BreadcrumbContainer>
        <Breadcrumb href="/courses">Courses</Breadcrumb>
        <Breadcrumb href={`/courses/${courseSlug}`}>{titles.lesson.course.title}</Breadcrumb>
        <BreadcrumbEscape href={`/courses/${courseSlug}/${lessonSlug}`}>
          {titles.lesson.title}
        </BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col items-start gap-4">
        <h1 className="font-bold text-3xl underline">{titles.title}</h1>
        <DrillHome />
      </main>
    </>
  );
});
