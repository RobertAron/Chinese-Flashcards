import { getDb } from "cms-data";

const globalForDrizzle = global as unknown as {
  drizzle: ReturnType<typeof getDb>;
};

function generateDrizzleClient() {
  return getDb(`${process.cwd()}/local.db`);
}
export function getDrizzleClient() {
  const drizzle = globalForDrizzle.drizzle ?? generateDrizzleClient();
  if (process.env.NODE_ENV !== "production") globalForDrizzle.drizzle = drizzle;
  return drizzle;
}
