import { notFound } from "next/navigation";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { Admin } from "./client";

const getWords = () =>
  getDrizzleClient().query.words.findMany({
    orderBy: (t, { asc }) => asc(t.frequencyRank),
  });

export type WordsPromise = Awaited<ReturnType<typeof getWords>>;

export const dynamic = "force-static";
export default AppServerPageEntrypoint(async () => {
  if (process.env.NODE_ENV !== "development") notFound();
  const words = await getWords();

  return (
    <div className="grid w-full grid-flow-row gap-3 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold underline">Admin</h1>
        <Admin words={words} />
      </div>
    </div>
  );
});
