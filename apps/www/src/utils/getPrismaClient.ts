// lib/prisma.ts
import { PrismaClient } from "cms-db";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export function getPrismaClient() {
  const prisma = globalForPrisma.prisma ?? new PrismaClient({});
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
