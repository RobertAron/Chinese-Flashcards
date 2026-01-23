import { AppServerPageEntrypoint } from "@/components/AppPage";
import { WordExperience } from "@/components/challenges/WordPoints";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { ExperienceBox } from "./client";

const getWords = () =>
  getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "asc",
    },
    where: {
      hskLevel: "hsk1",
      buildingBlockOnly: false,
    },
    include: {
      canonicalWord: {
        select: {
          id: true,
          characters: true,
          meaning: true,
        },
      },
    },
  });

export default AppServerPageEntrypoint(async function Page() {
  const words = await getWords();
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="grid grid-cols-24 gap-2">
        {words.map((ele) => (
          <ExperienceBox key={ele.id} wordId={ele.id} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {words.slice(0, 1_000).map((ele) => (
          <WordExperience key={ele.id} {...ele} />
        ))}
      </div>
    </div>
  );
});
