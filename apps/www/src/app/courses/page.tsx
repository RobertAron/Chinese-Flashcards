import { cacheLife } from "next/cache";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";
import { getPrismaClient } from "@/utils/getPrismaClient";

export const ensureStatic = "navigation";

export default AppServerPageEntrypoint(async function Courses() {
  "use cache";
  cacheLife("max");
  const courses = await getPrismaClient().course.findMany({
    orderBy: {
      ordering: "asc",
    },
    select: {
      slug: true,
      title: true,
      Lesson: true,
    },
  });
  return (
    <div className="flex w-full flex-col px-3 pt-1 pb-3">
      <BreadcrumbContainer>
        <BreadcrumbEscape href="/">Home</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex w-full flex-col gap-4">
        <h1 className="font-bold text-5xl underline">Courses</h1>
        <div className="grid w-full grid-cols-3 gap-1">
          {courses.map((topic) => (
            <MotionLink
              initial={{ opacity: 0, scaleY: 1.02 }}
              animate={{ opacity: 1, scaleY: 1 }}
              className={`col-span-3 grid hocus:scale-[102%] pressed:scale-[102%] transition-[scale] duration-100 ${buttonBehaviorClasses}`}
              href={`/courses/${topic.slug}`}
              key={topic.slug}
            >
              <div className="font-bold text-4xl">{topic.title}</div>
            </MotionLink>
          ))}
        </div>
      </main>
    </div>
  );
});
