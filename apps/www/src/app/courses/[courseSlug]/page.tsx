import { AppServerPageEntrypoint } from "@/components/AppPage";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { notFound } from "next/navigation";
import { paramsTemplate } from "./paramsTemplate";
import { generateStaticParams } from "./generateStaticParams";
import { LessonProgress } from "./client";
import { getDrizzleClient } from "@/utils/getDrizzleClient";

export { generateStaticParams };
export default AppServerPageEntrypoint(async function TopicCollection({ params }) {
  const { courseSlug } = paramsTemplate.parse(await params);
  const course = await getDrizzleClient().query.course.findFirst({
    where: (course, { eq }) => eq(course.slug, courseSlug),
    columns: {
      title: true,
    },
    with: {
      lessons: {
        columns: {
          slug: true,
          title: true,
        },
        with: {
          drills: {
            columns: {
              slug: true,
            },
          },
        },
      },
    },
  });
  // const course = await getPrismaClient().course.findUnique({
  //   where: { slug: courseSlug },
  //   select: {
  //     lessons: {
  //       select: {
  //         slug: true,
  //         title: true,
  //         drills: {
  //           select: {
  //             slug: true,
  //           },
  //         },
  //       },
  //     },
  //     title: true,
  //   },
  // });
  if (course == null) notFound();
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
              <div className="col-span-2">{ele.title}</div>
              <LessonProgress
                drillSlugs={[...ele.drills.map((ele) => ele.slug), `final-mastery-${ele.slug}`]}
              />
            </MotionLink>
          ))}
        </div>
      </main>
    </>
  );
});
