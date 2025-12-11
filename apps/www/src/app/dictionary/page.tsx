import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { SearchPage } from "./client";

export type Words = Awaited<ReturnType<typeof getWords>>;
const getWords = () =>
  getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "asc",
    },
  });
export default AppServerPageEntrypoint(async () => {
  return <SearchPage words={await getWords()} />;
});
