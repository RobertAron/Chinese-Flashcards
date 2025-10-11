import { AppServerPageEntrypoint } from "@/components/AppPage";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";
import { LessonProgress } from "./client";
import { generateStaticParams } from "./generateStaticParams";
import { getCourseOutline } from "./getCourseOutline";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };
export default AppServerPageEntrypoint(async function TopicCollection({ params }) {
  const { courseSlug } = paramsTemplate.parse(await params);
  const course = await getCourseOutline(courseSlug);
  return (
    <>
      <BreadcrumbContainer>
        <BreadcrumbEscape href="/courses">Courses</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold underline">{course.title}</h1>
        <div className="grid grid-cols-3 gap-1">
          {course.Lesson.map((ele) => (
            <MotionLink
              initial={{ opacity: 0, scaleY: 1.05 }}
              animate={{ opacity: 1, scaleY: 1 }}
              whileHover={{ scale: 1.05 }}
              whileFocus={{ scale: 1.05 }}
              className={`col-span-3 grid grid-cols-subgrid ${buttonBehaviorClasses}`}
              href={`/courses/${courseSlug}/${ele.slug}`}
              key={ele.slug}
            >
              <div className="col-span-2">{ele.title}</div>
              <LessonProgress
                drillSlugs={[...ele.Drill.map((ele) => ele.slug), `final-mastery-${ele.slug}`]}
              />
            </MotionLink>
          ))}
        </div>
      </main>
    </>
  );
});
