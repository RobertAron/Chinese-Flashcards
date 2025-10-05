import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { ConditionalWord } from "./client";

const getWords = () =>
  getDrizzleClient().query.words.findMany({
    orderBy: (t, { asc }) => asc(t.frequencyRank),
    where: (t, { inArray }) =>
      inArray(t.hskLevel, [
        "hsk1",
        //  "hsk2", "hsk3"
      ]),
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
