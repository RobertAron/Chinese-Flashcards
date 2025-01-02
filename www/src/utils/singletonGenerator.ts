const nothing = Symbol("Singleton Getter Nothing Symbol");
export function createSingletonGetter<T>(cb: () => T) {
  let item: typeof nothing | T = nothing;
  return function getSingleton() {
    if (item === nothing) item = cb();
    return item;
  };
}
