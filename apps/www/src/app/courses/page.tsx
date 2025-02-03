import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { PracticeCountCell, TimeAttackCell } from "./client";
import { getPrismaClient } from "@/utils/getPrismaClient";

export default async function Home() {
  const prisma = getPrismaClient();
  const topics = await prisma.topicCollection.findMany({
    select: {
      slug: true,
      title: true,
      challenges: {
        select: {
          slug: true,
        },
      },
    },
  });
  return (
    <main className="flex flex-col p-2">
      <h1 className="font-black text-6xl text-blue-700">Courses</h1>
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-3 grid grid-cols-subgrid">
          <div>course</div>
          <div className="text-end">Practice</div>
          <div className="text-end">Speedrun</div>
        </div>
        {topics.map((topic) => (
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
            <div className="flex flex-col items-end">
              {topic.challenges.map(({ slug }) => (
                <PracticeCountCell challengeId={slug} key={slug} />
              ))}
            </div>
            <div className="flex flex-col items-end">
              {topic.challenges.map(({ slug }) => (
                <TimeAttackCell challengeId={slug} key={slug} />
              ))}
            </div>
          </MotionLink>
        ))}
      </div>
    </main>
  );
}
