import { AppServerPageEntrypoint } from "@/components/AppPage";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { notFound } from "next/navigation";
import { LessonProgress } from "./client";
import { generateStaticParams } from "./generateStaticParams";
import { paramsTemplate } from "./paramsTemplate";

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
        orderBy: (t, { asc }) => asc(t.ordering),
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
      <main className="flex flex-col gap-4">
        <h1 className="font-bold text-5xl underline">{course.title}</h1>
        <div className="grid grid-cols-3 gap-1">
          {course.lessons.map((ele) => (
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
                drillSlugs={[...ele.drills.map((ele) => ele.slug), `final-mastery-${ele.slug}`]}
              />
            </MotionLink>
          ))}
        </div>
      </main>
    </>
  );
});
