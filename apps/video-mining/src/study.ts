import { Database } from "bun:sqlite";
import tts from "@google-cloud/text-to-speech";
import { S3Client } from "bun";
import { studyDatabasePath, type WordInfo } from "./dictionary";
import { transliterate } from "./media";

/**
 * Writing to the study app: its database (apps/db/local.db) and its media bucket on R2. Credentials come from
 * apps/www/.env.local, which the package's `mine` and `review` scripts load.
 */

export function studyBucket() {
  const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, CF_R2_ENDPOINT } = process.env;
  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !CF_R2_ENDPOINT) {
    throw new Error("Set ACCESS_KEY_ID, SECRET_ACCESS_KEY and CF_R2_ENDPOINT (apps/www/.env.local).");
  }
  return new S3Client({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    endpoint: CF_R2_ENDPOINT,
  });
}

let speechClient: InstanceType<typeof tts.TextToSpeechClient> | undefined;
const speech = () => {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS (apps/www/.env.local).");
  }
  const { client_email, private_key } = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  speechClient ??= new tts.TextToSpeechClient({ credentials: { client_email, private_key } });
  return speechClient;
};

// Same speech as the study app's admin /generate-audio: a single character is pinned to its pinyin (so 还 is
// read huán when that's the reading), anything longer is read as plain text.
const toneByMark: Record<string, number> = { "̄": 1, "́": 2, "̌": 3, "̀": 4 };
function numberedPinyin(pinyin: string) {
  const letters = [...pinyin.trim().toLowerCase().normalize("NFD")];
  const tone = letters.map((letter) => toneByMark[letter]).find((mark) => mark !== undefined);
  const syllable = letters
    .filter((letter) => toneByMark[letter] === undefined)
    .join("")
    .match(/^([a-z]+)([1-5])?$/);
  return syllable === null ? null : `${syllable[1]}${tone ?? syllable[2] ?? 5}`;
}
const escapeXml = (text: string) => text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);

async function synthesize(characters: string, pinyin: string) {
  const phoneme = [...characters].length === 1 ? numberedPinyin(pinyin) : null;
  const ssml = `<speak>${phoneme === null ? escapeXml(characters) : `<phoneme alphabet="pinyin" ph="${phoneme}">${escapeXml(characters)}</phoneme>`}</speak>`;
  const [response] = await speech().synthesizeSpeech({
    audioConfig: { audioEncoding: "MP3", pitch: 0, speakingRate: 0.75, sampleRateHertz: 48000 },
    input: { ssml },
    voice: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-B" },
  });
  if (!response.audioContent) throw new Error(`Google TTS returned no audio for ${characters}`);
  return Buffer.from(response.audioContent);
}

export type NewStudyWord = { characters: string; pinyin: string; meaning: string; hskLevel: number | null };

/**
 * Adds a word to the study app the way its other words were made: a Words row (frequency rank 999999, as for
 * names and words without frequency data) and Google TTS audio at words/<id>.mp3. Speech is made first and the
 * row is removed again if the upload fails, so a failure never leaves a word without audio.
 */
export async function addStudyWord(word: NewStudyWord) {
  const bucket = studyBucket();
  const audio = await synthesize(word.characters, word.pinyin);
  const study = new Database(studyDatabasePath);
  try {
    const existing = study
      .query<{ id: number }, [string]>("SELECT id FROM Words WHERE characters = ?")
      .get(word.characters);
    if (existing !== null)
      throw new Error(`${word.characters} is already in the study app (Words ${existing.id}).`);
    const { id } = study
      .query<{ id: number }, [string, string, string, string | null]>(
        "INSERT INTO Words (characters, pinyin, meaning, frequencyRank, hskLevel) VALUES (?, ?, ?, 999999, ?) RETURNING id",
      )
      .get(
        word.characters,
        word.pinyin,
        word.meaning,
        word.hskLevel === null ? null : `hsk${Math.min(7, word.hskLevel)}`,
      )!;
    try {
      await bucket.write(`words/${id}.mp3`, audio, { type: "audio/mpeg" });
    } catch (error) {
      study.run("DELETE FROM Words WHERE id = ?", [id]);
      throw error;
    }
    return id;
  } finally {
    study.close();
  }
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const withoutTones = (pinyin: string) => pinyin.normalize("NFD").replace(/\p{M}/gu, "");

/**
 * Suggested Words fields for words the study app lacks. Names get pinyin from macOS's transliteration (which
 * knows name readings such as 池长老 → zhǎng), joined and capitalised the way the study app writes them
 * (小黑 → Xiǎohēi), and a "Xiaohei (name)" meaning. Other words use vocab-reference when it has them.
 */
export async function suggestStudyWords(words: readonly WordInfo[]) {
  const syllables = await transliterate(words.map((word) => word.characters));
  return words.map((word, index) => {
    const isName = word.kind === "name";
    const transliterated = (syllables[index] ?? []).join("");
    if (word.kind === "punctuation") {
      return { pinyin: word.characters, meaning: "", hskLevel: null };
    }
    if (isName) {
      const pinyin = capitalise(transliterated);
      return { pinyin, meaning: `${capitalise(withoutTones(pinyin))} (name)`, hskLevel: null };
    }
    return {
      pinyin: word.pinyin[0] ?? transliterated,
      meaning: word.meaning ?? "",
      hskLevel: word.dictionaryLevel,
    };
  });
}
