import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "vocab-db/prisma";

/**
 * The libsql adapter doesn't report a bind-value limit, so Prisma 7 falls back to 999 for SQLite and
 * rejects larger queries (P2029), such as nested selects over every phrase. libsql's SQLite allows 32766.
 */
class PrismaLibSqlWithBindLimit extends PrismaLibSql {
  override async connect() {
    const adapter = await super.connect();
    return Object.assign(adapter, {
      getConnectionInfo: () => ({ maxBindValues: 32766, supportsRelationJoins: false }),
    });
  }
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

function getPrismaClient() {
  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaLibSqlWithBindLimit({
        url: `file:${path.join(process.cwd(), "../db/local.db")}`,
      }),
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}

export { getPrismaClient };
