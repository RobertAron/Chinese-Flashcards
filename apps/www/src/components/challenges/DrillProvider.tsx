"use client";
import type React from "react";
import { ezCreateContext } from "@/utils/createContext";
import type { DrillInfo, PhraseDefinition, WordDefinition } from "./challengeServerUtils";

interface ProviderProps extends DrillInfo {
  children?: React.ReactNode;
  courseSlug: string;
  lessonSlug: string;
  drillSlug: string;
  homeHref: string;
}

type ProvidedValue = {
  challengeId: string;
  challengeLabel: string;
  description: string | null;
  wordDefinitions: WordDefinition[];
  phraseDefinitions: PhraseDefinition[];
  lessonSlug: string;
  courseSlug: string;
  homeHref: string;
};

export const { Provider: DrillProvider, useContext: useDrillContext } = ezCreateContext<
  ProvidedValue,
  ProviderProps
>(
  (P) =>
    ({ courseSlug, description, drillSlug, drillTitle, lessonSlug, phrases, words, children, homeHref }) => (
      <P
        value={{
          challengeId: drillSlug,
          challengeLabel: drillTitle,
          wordDefinitions: words,
          phraseDefinitions: phrases,
          description,
          courseSlug,
          lessonSlug,
          homeHref,
        }}
      >
        {children}
      </P>
    ),
);
