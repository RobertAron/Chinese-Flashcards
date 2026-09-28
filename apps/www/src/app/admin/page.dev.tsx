import { connection } from "next/server";
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

export type WordsPromise = Awaited<ReturnType<typeof getWords>>;

// Dev-only admin tool: reads the DB at request time so edits show up on reload.
export const instant = false;
export default AppServerPageEntrypoint(async () => {
  // connect required due to some weird issue with prisma date queries
  await connection();
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
