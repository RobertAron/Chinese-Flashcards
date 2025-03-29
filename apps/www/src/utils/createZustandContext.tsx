import { generateContext } from "@/utils/createContext";
import { useRef } from "react";
import { createStore, type Mutate, type StoreApi } from "zustand";

type Primitive = string | number | boolean | null | undefined;
type Serializable = Primitive | Serializable[] | { [key: string]: Serializable };
type StateObject = Record<PropertyKey, Serializable>;

function createZustandStore<State extends StateObject>({
  defaultState,
  initialState,
}: { defaultState: State; initialState?: Partial<State> }) {
  return createStore<State & { update: StoreApi<State>["setState"] }>((set) => ({
    ...defaultState,
    ...initialState,
    update: set,
  }));
}

/**
 * @example
 * ```ts
 * const { Provider: CountProvider, useContext: useCountProviderStore } = 
 *   createZustandContext<{ count: number }>({
 *     initState: {
 *       count: 0,
 *     },
 *   });
 * ```
 */
export function createZustandContext<State extends StateObject>(defaultState: State) {
  type ContextProps = { initialState?: Partial<State>; children: React.ReactNode };
  type ProvidedValue = Mutate<ReturnType<typeof createZustandStore<State>>, []>;
  return generateContext<ContextProps, ProvidedValue>(
    (Provider) =>
      function ZustandContextProvider({ children, initialState }) {
        const store = useRef(
          createZustandStore<State>({
            defaultState,
            initialState,
          }),
        ).current;
        return <Provider value={store}>{children}</Provider>;
      },
  );
}
