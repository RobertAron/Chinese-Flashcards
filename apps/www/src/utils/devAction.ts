// utils/devServerAction.ts
export const devOnly = process.env.NODE_ENV === "development" ? <T>(i: T) => i : <T>(_: T) => undefined;
