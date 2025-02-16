import { AppServerPageEntrypoint } from "@/components/AppPage";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { notFound } from "next/navigation";
import { paramsTemplate } from "./paramsTemplate";
import { generateStaticParams } from "./generateStaticParams";

export { generateStaticParams };
export default AppServerPageEntrypoint(async function TopicCollection({ params }) {
  const { courseSlug } = paramsTemplate.parse(await params);
  const course = await getPrismaClient().course.findUnique({
    where: { slug: courseSlug },
    select: {
      lessons: true,
      title: true,
    },
  });
  if (course === null) notFound();
  return (
    <>
      <BreadcrumbContainer>
        <BreadcrumbEscape href="/courses">Courses</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex flex-col">
        <h1 className="font-black text-6xl text-blue-700">{course.title}</h1>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-3 grid grid-cols-subgrid">
            <div>Lesson</div>
          </div>
          {course.lessons.map((ele) => (
            <MotionLink
              initial={{ opacity: 0, scaleY: 1.05 }}
              animate={{ opacity: 1, scaleY: 1 }}
              whileHover={{ scale: 1.1 }}
              whileFocus={{ scale: 1.1 }}
              className={`col-span-3 grid grid-cols-subgrid ${buttonBehaviorClasses}`}
              href={`/courses/${courseSlug}/${ele.slug}`}
              key={ele.slug}
            >
              <div>{ele.title}</div>
            </MotionLink>
          ))}
        </div>
      </main>
    </>
  );
});
