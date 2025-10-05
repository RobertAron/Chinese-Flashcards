import { notFound } from "next/navigation";
import OpenAI from "openai";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { devOnly } from "@/utils/devAction";
import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { Admin } from "./client";

const client = new OpenAI();

const getWords = () =>
  getDrizzleClient().query.words.findMany({
    orderBy: (t, { asc }) => asc(t.frequencyRank),
  });
const createImage = devOnly(async (phrase: string) => {
  "use server";
  const prompt = `
You will receive a Chinese phrase. Create an image that visually represents the meaning of the phrase.
The image will be used as a flashcard, where the viewer guesses or writes the phrase based on the image.
Guidelines:
	•	Do not include text.
	•	Do not include chinese characters.
	•	Do not include emojis.
	•	Style should be minimal/anime/cartoon.
  •	Every word in the phrase must be visually represented — the image should make each word essential to understanding the overall meaning.
  •	Do not apply warm filters or sepia tones. Use cool neutrals (soft grays, off-whites) as balancing colors.
  •	This means the background should be white, or grey.
	•	Keep the image simple by reducing hues. Use primarily these colors. 
#FBE1CBff
#C95F58ff
#C3CCCBff
#4A403Fff
#2A2A2Cff
#F7C8A4ff
#FFFFFFff
#FA9F8Bff
#ECAB9Bff
#F0AD99ff
#fe447d
#f78f2e
#fedc0c
#d1f20a
#5cd05b
#03c1cd
#0e10e6
#9208e7
#f84c00
#f3f354
#bff1e5
#3bc335
#7af5ca
#448bff
#101ab3
#d645c8
#0afe15
#0acdfe
#ff9600
#b21ca1 
Phrase:
${phrase}
`;
  const img = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
  });
  const b64 = img.data?.[0]?.b64_json;
  return b64;
});
export type CreateImageAction = typeof createImage;
export type WordsPromise = Awaited<ReturnType<typeof getWords>>;

export const dynamic='force-static'
export default AppServerPageEntrypoint(async () => {
  if (process.env.NODE_ENV !== "development") notFound();
  const words = await getWords();

  return (
    <div className="w-full py-4 grid grid-flow-row gap-3">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold underline">Admin</h1>
        <Admin words={words} createImageAction={createImage} />
      </div>
    </div>
  );
});
