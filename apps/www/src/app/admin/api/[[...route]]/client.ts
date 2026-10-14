import { hc } from "hono/client";
import useSWRMutation from "swr/mutation";
import type { Api } from "./route.dev";

const client = hc<Api>("");

type AudioWord = { characters: string; pinyin: string | null };
export function useMakeAudio() {
  return useSWRMutation(
    "makeAudio",
    async (_: string, { arg: { words } }: { arg: { words: AudioWord[] } }) => {
      const response = await client.admin.api["generate-audio"].$post({ json: { words } });
      if (!response.ok) throw new Error();
      return await response.blob();
    },
  );
}
export function useMakeImage() {
  return useSWRMutation(
    "makeImage",
    async (
      _: string,
      {
        arg: { phrase, meaning, extraInstructions },
      }: { arg: { phrase: string; meaning: string; extraInstructions: string } },
    ) => {
      const response = await client.admin.api["generate-image"].$post({
        json: { phrase, meaning, extraInstructions },
      });
      if (!response.ok) throw new Error();
      return await response.json();
    },
  );
}

const submitChallenge = client.admin.api["submit-challenge"].$post;
type SubmitChallengeProps = Parameters<typeof submitChallenge>[0];
export function useSubmitChallenge() {
  return useSWRMutation(
    "submitChallenge",
    async (_: string, { arg: { form } }: { arg: SubmitChallengeProps }) => {
      const response = await submitChallenge({ form });
      if (!response.ok) throw new Error();
      return response.json();
    },
  );
}

const generatePhraseSuggestionEndpoint = client.admin.api["generate-phrase-suggestion"].$post;
type GeneratePhraseParams = Parameters<typeof generatePhraseSuggestionEndpoint>[0];
export function useMakePhraseSuggestions() {
  return useSWRMutation(
    "submit-for-suggestions",
    async (_: string, { arg: { json } }: { arg: GeneratePhraseParams }) => {
      const response = await generatePhraseSuggestionEndpoint({
        json,
      });
      if (!response.ok) throw new Error();
      return response.json();
    },
  );
}
