import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { PracticeCountCell, TimeAttackCell } from "../client";
import { AppServerEntrypoint } from "@/components/AppPage";
import { z } from "zod";
import { getPrismaClient } from "@/utils/getPrismaClient";

const paramsTemplate = z.object({ courseSlug: z.string() });
export default AppServerEntrypoint(async function TopicCollection({ params }) {
  const { courseSlug } = paramsTemplate.parse(await params);
  const topics = await getPrismaClient().topic.findMany({
    where: { topicCollectionSlug: courseSlug },
  });
  return (
    <main className="flex flex-col p-2">
      <h1 className="font-black text-6xl text-blue-700">Lessons</h1>
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-3 grid grid-cols-subgrid">
          <div>Lesson</div>
          <div className="text-end">Practice</div>
          <div className="text-end">Speedrun</div>
        </div>
        {topics.map((ele) => (
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
            <PracticeCountCell challengeId={ele.slug} />
            <TimeAttackCell challengeId={ele.slug} />
          </MotionLink>
        ))}
      </div>
    </main>
  );
});
