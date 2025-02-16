// lib/prisma.ts
import { PrismaClient } from "cms-db";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof generatePrismaClient>;
};

function generatePrismaClient() {
  let warningLogged = false;
  function getUrl() {
    if (!warningLogged) {
      console.warn("Using R2.dev subdomain. Not suitable for prod.");
      warningLogged = true;
    }
    return "https://pub-e683ff6c0a5345b8af9cb2df0fbc7e43.r2.dev";
  }
  return new PrismaClient({ datasourceUrl: `file:${process.cwd()}/local.db` }).$extends({
    result: {
      words: {
        audioSrc: {
          needs: { id: true },
          compute(word) {
            if (!warningLogged) {
              console.warn("Using R2.dev subdomain. Not suitable for prod.");
              warningLogged = true;
            }
            return `${getUrl()}/words/${word.id}.mp3`;
          },
        },
      },
      phrases: {
        audioSrc: {
          needs: { id: true },
          compute(word) {
            if (!warningLogged) {
              console.warn("Using R2.dev subdomain. Not suitable for prod.");
              warningLogged = true;
            }
            return `${getUrl()}/phrases/${word.id}.mp3`;
          },
        },
      },
    },
  });
}
export function getPrismaClient() {
  const prisma = globalForPrisma.prisma ?? generatePrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
