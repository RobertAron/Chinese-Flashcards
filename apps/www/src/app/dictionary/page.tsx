import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { SearchPage } from "./client";

export type Words = Awaited<ReturnType<typeof getWords>>;
const getWords = () =>
  getDrizzleClient().query.words.findMany({
    orderBy: (t, { asc }) => asc(t.frequencyRank),
  });
export default AppServerPageEntrypoint(async () => {
  return <SearchPage words={await getWords()} />;
});
