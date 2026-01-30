import { notFound } from "next/navigation";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { getDrillInfo } from "@/components/challenges/challengeServerUtils";
import { DrillHome } from "./client";
import { generateStaticParams } from "./generateStaticParams";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };
export const revalidate = 86400;
export default AppServerPageEntrypoint(async ({ params }) => {
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
});
