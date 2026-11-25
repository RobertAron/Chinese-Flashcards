import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "vocab-db/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

function getPrismaClient() {
  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaLibSql({
        url: `file:${path.join(process.cwd(), "../db/local.db")}`,
      }),
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}

export { getPrismaClient };
