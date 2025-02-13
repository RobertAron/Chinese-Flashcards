import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { getPrismaClient } from "@/utils/getPrismaClient";

export default async function Home() {
  const prisma = getPrismaClient();
  const courses = await prisma.course.findMany({
    select: {
      slug: true,
      title: true,
      lessons: {
        select: {
          slug: true,
        },
      },
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
}
