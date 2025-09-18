import { useRef } from "react";
import { createStore, type Mutate, type StoreApi } from "zustand";
import { ezCreateContext } from "@/utils/createContext";

type Primitive = string | number | boolean | null | undefined;
type Serializable = Primitive | Serializable[] | { [key: string]: Serializable };
type StateObject = Record<PropertyKey, Serializable>;

function createZustandStore<State extends StateObject>({
  defaultState,
  initialState,
}: {
  defaultState: State;
  initialState?: Partial<State>;
}) {
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
  return ezCreateContext<ProvidedValue, ContextProps>((P) => ({ children, initialState }) => {
    const store = useRef(
      createZustandStore<State>({
        defaultState,
        initialState,
      }),
    ).current;
    return <P value={store}>{children}</P>;
  });
}
