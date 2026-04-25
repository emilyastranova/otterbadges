import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || (() => {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  // The adapter instance should be reused in dev mode to prevent multiple file handles
  const adapter = new PrismaBetterSqlite3({ url });
  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
  return client;
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Trigger rebuild for schema change
