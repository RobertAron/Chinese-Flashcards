"use client";
import type React from "react";
import { createContext, use } from "react";
export function generateContext<ProviderProps, ProvidedValue>(
  generateProvider: (
    Provider: React.Context<ProvidedValue | null>,
  ) => (props: ProviderProps) => React.ReactNode,
) {
  const Context = createContext<ProvidedValue | null>(null);
  const useContext = () => {
    const context = use(Context);
    if (context === null) throw new Error("Context used without provider.");
    return context;
  };
  const Provider = generateProvider(Context);
  return {
    useContext,
    Provider,
  };
}
