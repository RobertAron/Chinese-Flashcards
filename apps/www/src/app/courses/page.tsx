import { AppServerPageEntrypoint } from "@/components/AppPage";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";
import { getPrismaClient } from "@/utils/getPrismaClient";

export default AppServerPageEntrypoint(async function Home() {
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
    <main className="flex w-full flex-col gap-4">
      <h1 className="font-bold text-5xl underline">Courses</h1>
      <div className="grid w-full grid-cols-3 gap-1">
        {courses.map((topic) => (
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.02 }}
            animate={{ opacity: 1, scaleY: 1 }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
            className={`col-span-3 grid ${buttonBehaviorClasses}`}
            href={`/courses/${topic.slug}`}
            key={topic.slug}
          >
            <div className="font-bold text-4xl">{topic.title}</div>
          </MotionLink>
        ))}
      </div>
    </main>
  );
});
