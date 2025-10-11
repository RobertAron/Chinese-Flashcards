import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { ConditionalWord } from "./client";

const getWords = () =>
  getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "asc",
    },
    where: {
      hskLevel: "hsk1",
    },
  });

export default AppServerPageEntrypoint(async function Page() {
  const words = await getWords();
  return (
    <div className="grid grid-cols-4 gap-2">
      {words.slice(0, 1_000).map((ele) => (
        <ConditionalWord key={ele.id} {...ele} />
      ))}
    </div>
  );
});
