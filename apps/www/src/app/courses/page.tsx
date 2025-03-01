import { AppServerPageEntrypoint } from "@/components/AppPage";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
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
    <main className="flex flex-col">
      <h1 className="font-black text-6xl text-blue-700">Courses</h1>
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-3 grid grid-cols-subgrid">
          <div>Course</div>
        </div>
        {courses.map((topic) => (
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.05 }}
            animate={{ opacity: 1, scaleY: 1 }}
            whileHover={{ scale: 1.1 }}
            whileFocus={{ scale: 1.1 }}
            className={`col-span-3 grid grid-cols-subgrid ${buttonBehaviorClasses}`}
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
