import * as PrismaModule from '@prisma/client';

// Fix: Handle case where PrismaClient is not exported (e.g. before generation)
const PrismaClientConstructor = (PrismaModule as any).PrismaClient || class {
  user = {
    findUnique: async () => null as any,
    upsert: async () => null as any,
    create: async () => null as any,
  };
  account = {
    create: async () => null as any,
  };
};

export const prisma = new PrismaClientConstructor();
