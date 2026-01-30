import { notFound } from "next/navigation";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { WordOutline } from "@/components/challenges/WordOutline";
import { HskBadge } from "@/components/HskBadge";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { phraseToAudioSource, phraseToImageSource, wordToAudioSource } from "@/utils/idToAudioSource";
import { Link } from "@/utils/NextNavigationUtils";
import { spacePunctuation } from "@/utils/specialCharacters";
import { deDupe } from "@/utils/structureUtils";
import { generateStaticParams } from "./generateStaticParams";
import { paramsTemplate } from "./paramsTemplate";

export { generateStaticParams };

async function getWord(wordId: number) {
  return getPrismaClient().words.findUnique({
    where: { id: wordId },
    include: {
      canonicalWord: {
        select: {
          id: true,
          characters: true,
          meaning: true,
        },
      },
      variants: {
        select: {
          id: true,
          characters: true,
          pinyin: true,
          meaning: true,
          hskLevel: true,
        },
      },
      PhraseWords: {
        include: {
          phrase: {
            select: {
              id: true,
              meaning: true,
              PhraseWords: {
                orderBy: { order: "asc" },
                select: {
                  word: {
                    select: {
                      id: true,
                      characters: true,
                      pinyin: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
// in seconds
// 1 day
export const revalidate = 86400;
// 2 days
export const expire = 172800;
export default AppServerPageEntrypoint(async function WordDetailPage({ params }) {
  const { wordId } = paramsTemplate.parse(await params);
  const word = await getWord(wordId);
  if (word === null) notFound();
  const phrases = deDupe(
    word.PhraseWords.map(({ phrase }) => {
      return {
        id: phrase.id,
        meaning: phrase.meaning,
        characters: phrase.PhraseWords.map(({ word }) => word.characters)
          .join(" ")
          .replace(spacePunctuation, ""),
        pinyin: phrase.PhraseWords.map(({ word }) => word.pinyin).join(" "),
        audioSrc: phraseToAudioSource(phrase.id),
        imageSrc: phraseToImageSource(phrase.id),
      };
    }),
    (phrase) => phrase.id,
  );

  return (
    <div className="flex flex-col gap-6 py-4">
      <BreadcrumbContainer alwaysShow>
        <BreadcrumbEscape href="/dictionary">Dictionary</BreadcrumbEscape>
        <Breadcrumb href={`/dictionary/${word.id}`}>{word.characters}</Breadcrumb>
      </BreadcrumbContainer>

      <WordOutline
        word={{
          type: "word",
          id: word.id,
          characters: word.characters,
          pinyin: word.pinyin,
          meaning: word.canonicalWord?.meaning ?? word.meaning,
          audioSrc: wordToAudioSource(word.id),
          emojiChallenge: word.emojiChallenge,
          hskLevel: word.hskLevel,
          canonicalWord: word.canonicalWord,
        }}
      />

      {word.variants.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-2xl">Variants</h2>
          <p className="text-gray-600">Other forms of this word:</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {word.variants.map((variant) => (
              <li key={variant.id}>
                <Link
                  href={`/dictionary/${variant.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border-2 border-black bg-white p-3 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-2xl">{variant.characters}</span>
                    <span className="text-gray-600">{variant.pinyin}</span>
                  </div>
                  {variant.hskLevel && <HskBadge hskLevel={variant.hskLevel} />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {phrases.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-2xl">Example Phrases</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {phrases.map((phrase) => (
              <li key={phrase.id}>
                <WordOutline
                  word={{
                    type: "phrase",
                    id: phrase.id,
                    characters: phrase.characters,
                    pinyin: phrase.pinyin,
                    meaning: phrase.meaning,
                    audioSrc: phrase.audioSrc,
                    imageSrc: phrase.imageSrc,
                    emojiChallenge: null,
                    words: [],
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {phrases.length === 0 && word.variants.length === 0 && !word.canonicalWord && (
        <p className="text-gray-500">No example phrases available for this word yet.</p>
      )}
    </div>
  );
});
