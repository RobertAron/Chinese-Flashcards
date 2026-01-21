import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { Admin } from "./client";

const getWords = () =>
  getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "desc",
    },
    where: {
      buildingBlockOnly: false,
    },
  });

export type WordsPromise = Awaited<ReturnType<typeof getWords>>;

export const dynamic = "force-static";
export default AppServerPageEntrypoint(async () => {
  const words = await getWords();
  return (
    <div className="grid w-full grid-flow-row gap-3 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-5xl underline">Admin</h1>
        <Admin words={words} />
      </div>
    </div>
  );
});
