import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Removed the log configuration to disable logging
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;

  // Gracefully disconnect Prisma when stopping the server
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit();
  });

  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
  });
}
