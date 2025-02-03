import { AppServerEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbWrapper } from "@/components/Breadcrumb";
import { z } from "zod";
import { DrillHome } from "./client";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { notFound } from "next/navigation";

export const paramsTemplate = z.object({
  drillSlug: z.string(),
  lessonSlug: z.string(),
  courseSlug: z.string(),
});

export default AppServerEntrypoint(async ({ params }) => {
  const { drillSlug, courseSlug, lessonSlug } = paramsTemplate.parse(await params);
  const titles = await getPrismaClient().challenge.findUnique({
    where: { slug: drillSlug },
    select: {
      title: true,
      topic: {
        select: {
          title: true,
          TopicCollection: {
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
    <main className="flex flex-col items-start gap-4 p-1">
      <BreadcrumbWrapper>
        <Breadcrumb href="/courses">Courses</Breadcrumb>
        <Breadcrumb href={`/courses/${courseSlug}`}>{titles.topic.TopicCollection?.title}</Breadcrumb>
        <Breadcrumb href={`/courses/${courseSlug}/${lessonSlug}`}>{titles.topic.title}</Breadcrumb>
      </BreadcrumbWrapper>
      <h1 className="font-bold text-3xl underline">{titles.title}</h1>
      <DrillHome />
    </main>
  );
});
