"use client";
import { ChallengeItems, challenges } from "@/challenges/top100";
import { generateContext } from "@/utils/createContext";
import { useParams } from "next/navigation";
import React from "react";

type ProviderProps = {
  children?: React.ReactNode;
};
type ProvidedValue = {
  challengeId: string;
  challengeItems: ChallengeItems;
};

export const { Provider: ChallengeProvider, useContext: useChallengeContext } =
  generateContext<ProviderProps, ProvidedValue>(
    (Provider) =>
      function ChallengeProvider({ children }: ProviderProps) {
        const challengeId = useParams()["challengeId"];
        if (typeof challengeId !== "string") return null;
        const challengeItems = challenges[challengeId];
        if (challengeItems === undefined) return null;
        return (
          <Provider value={{ challengeId, challengeItems }}>
            {children}
          </Provider>
        );
      },
  );
