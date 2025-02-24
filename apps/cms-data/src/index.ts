import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as relations from "./relations";

export function getDb(file: string) {
  const client = createClient({ url: `file:${file}` });
  return drizzle({ client, schema: { ...schema, ...relations } });
}
