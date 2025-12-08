// In a real environment, this would import from @prisma/client
// import { PrismaClient } from '@prisma/client';

// export const prisma = new PrismaClient();

// Mock Prisma Client for environments where `prisma generate` has not been run
export const prisma = {
  user: {
    findUnique: async (args: any) => null,
    upsert: async (args: any) => ({ id: args.where?.id || 'demo-user-id', ...args.create }),
    create: async (args: any) => ({ id: 'new-user', ...args.data }),
    findFirst: async (args: any) => null,
    findMany: async (args: any) => [],
    update: async (args: any) => args.data,
    delete: async (args: any) => ({}),
  },
  account: {
    create: async (args: any) => ({ id: 'new-account', ...args.data }),
    findUnique: async (args: any) => null,
    findFirst: async (args: any) => null,
    findMany: async (args: any) => [],
    update: async (args: any) => args.data,
    delete: async (args: any) => ({}),
  },
  $connect: async () => { console.log('Mock DB connection established'); },
  $disconnect: async () => { console.log('Mock DB connection closed'); },
};