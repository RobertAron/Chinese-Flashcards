import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { notFound } from "next/navigation";
import { PracticeCountCell, TimeAttackCell } from "../../client";
import { generateStaticParams } from "./generateStaticParams";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };
export default AppServerPageEntrypoint(async function TopicCollection({ params }) {
  const { lessonSlug, courseSlug } = paramsTemplate.parse(await params);
  const lesson = await getPrismaClient().lesson.findUnique({
    where: { slug: lessonSlug },
    select: {
      title: true,
      drills: true,
      course: {
        select: {
          title: true,
        },
      },
    },
  });
  if (lesson === null) notFound();
  return (
    <>
      <BreadcrumbContainer>
        <Breadcrumb href="/courses">Courses</Breadcrumb>
        <BreadcrumbEscape href={`/courses/${courseSlug}`}>{lesson.course.title}</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col">
        <h1 className="font-black text-6xl text-blue-700">{lesson.title}</h1>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-3 grid grid-cols-subgrid">
            <div>Drill</div>
            <div className="text-end">Practice</div>
            <div className="text-end">Speedrun</div>
          </div>
          {lesson.drills.map((ele) => (
            <MotionLink
              initial={{ opacity: 0, scaleY: 1.05 }}
              animate={{ opacity: 1, scaleY: 1 }}
              whileHover={{ scale: 1.1 }}
              whileFocus={{ scale: 1.1 }}
              className={`col-span-3 grid grid-cols-subgrid ${buttonBehaviorClasses}`}
              href={`/courses/${courseSlug}/${lessonSlug}/${ele.slug}`}
              key={ele.slug}
            >
              <div>{ele.title}</div>
              <PracticeCountCell challengeId={ele.slug} />
              <TimeAttackCell challengeId={ele.slug} />
            </MotionLink>
          ))}
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.05 }}
            animate={{ opacity: 1, scaleY: 1 }}
            whileHover={{ scale: 1.1 }}
            whileFocus={{ scale: 1.1 }}
            className={`col-span-3 grid grid-cols-subgrid ${buttonBehaviorClasses}`}
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
});