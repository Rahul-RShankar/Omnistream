

// import { PrismaClient } from '@prisma/client';

// export const prisma = new PrismaClient();

// In environments where `prisma generate` has not been run, the @prisma/client package 
// does not export PrismaClient. We provide a mock implementation here to allow the 
// server to start and run in demo mode.

export const prisma = {
  user: {
    upsert: async (args: any) => {
      return { id: args.where.id, ...args.create };
    },
    findUnique: async (args: any) => {
      return { 
        id: args.where.id, 
        name: 'Demo User', 
        email: 'demo@streamforge.com',
        accounts: [] 
      };
    }
  },
  account: {
    create: async (args: any) => {
      return { 
        id: `acc_${Date.now()}`, 
        ...args.data 
      };
    },
    findMany: async (args: any) => {
      return [];
    }
  }
};