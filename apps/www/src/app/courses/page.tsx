import { AppServerPageEntrypoint } from "@/components/AppPage";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { MotionLink } from "@/components/MotionLink";
import { getDrizzleClient } from "@/utils/getDrizzleClient";

export default AppServerPageEntrypoint(async function Home() {
  const courses = await getDrizzleClient().query.course.findMany({
    orderBy: (t, { asc }) => asc(t.ordering),
    columns: {
      slug: true,
      title: true,
    },
    with: {
      lessons: true,
    },
  });
  return (
    <main className="flex flex-col w-full gap-4">
      <h1 className="text-5xl font-bold underline">Courses</h1>
      <div className="w-full grid grid-cols-3 gap-1">
        {courses.map((topic) => (
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.05 }}
            animate={{ opacity: 1, scaleY: 1 }}
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.05 }}
            className={`col-span-3 grid ${buttonBehaviorClasses}`}
            href={`/courses/${topic.slug}`}
            key={topic.slug}
          >
            <div className="text-4xl font-bold">{topic.title}</div>
          </MotionLink>
        ))}
      </div>
    </main>
  );
});
