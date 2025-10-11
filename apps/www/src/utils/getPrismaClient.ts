import { PrismaClient } from "vocab-db/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

function getPrismaClient() {
  const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasourceUrl:"??"
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}

export { getPrismaClient };
