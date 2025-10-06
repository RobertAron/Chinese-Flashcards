import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { schema } from "cms-data";

const drizzle = getDrizzleClient();
const punctuation = /[.?？’,!。，！ ]/;
const regex = new RegExp(`(?=${punctuation.source})|(?<=${punctuation.source})`);
async function main() {
  const wordsRaw = await drizzle.query.words.findMany();
  const phrases = await drizzle.query.phrases.findMany();
  const wordLookupObject = Object.fromEntries(wordsRaw.map((ele) => [ele.characters, ele]));
  for (const phrase of phrases) {
    const characters = phrase.characters.split(regex).filter((ele) => ele.trim() !== "");
    await Promise.all(
      characters.map((ele, index) => {
        const word = wordLookupObject[ele];
        return drizzle.insert(schema.phraseWords).values({
          phrasesId: phrase.id,
          wordsId: word!.id,
          order: index,
        });
      }),
    );
  }
  // const hmm = await drizzle.query.phrases.findMany();
  // console.log(hmm);
}

main();
