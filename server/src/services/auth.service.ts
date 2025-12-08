
import { prisma } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const authService = {
  // Mock function for OAuth flow start
  async getOAuthUrl(platform: string) {
    const state = uuidv4();
    // In a real app, generate the platform-specific OAuth URL
    return { 
      url: `https://mock-auth.streamforge.com/${platform}?state=${state}`,
      state 
    };
  },

  // Handle callback and store account in DB
  async handleCallback(platform: string, code: string, userId: string) {
    // 1. Exchange code for tokens (Mocked for now)
    const mockToken = `access_token_${Date.now()}`;
    const mockRefresh = `refresh_token_${Date.now()}`;
    
    // 2. Ensure User exists before creating Account to satisfy Foreign Key constraint
    // In a real flow, the user would already be logged in or created via sign-up.
    // For this dev setup, we upsert the demo user.
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: 'Demo User',
        email: 'demo@streamforge.com'
      }
    });

    // 3. Save account to DB
    const account = await prisma.account.create({
      data: {
        userId,
        platform,
        accessToken: mockToken, // Should be encrypted in production
        refreshToken: mockRefresh, // Should be encrypted in production
        status: 'connected'
      }
    });

    return account;
  },

  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { accounts: true }
    });
  }
};
