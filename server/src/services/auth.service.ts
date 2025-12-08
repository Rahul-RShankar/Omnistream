import { prisma } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const authService = {
  // Generate real OAuth URLs based on platform
  async getOAuthUrl(platform: string) {
    const state = uuidv4();
    let url = '';

    switch (platform) {
      case 'youtube':
        const googleScope = [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ].join(' ');
        url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=${googleScope}&access_type=offline&state=${state}`;
        break;
      
      case 'twitch':
        const twitchScope = 'user:read:email channel:read:stream_key';
        url = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_CALLBACK_URL}&response_type=code&scope=${twitchScope}&state=${state}`;
        break;

      case 'facebook':
        const fbScope = 'public_profile,email';
        url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}&state=${state}&scope=${fbScope}`;
        break;

      default:
        // Fallback for demo if env vars are missing or platform is generic
        url = `http://localhost:3000/api/auth/mock/${platform}?state=${state}`;
    }

    // If secrets are missing, fallback to mock to prevent crash during dev
    if (!process.env.GOOGLE_CLIENT_ID && platform === 'youtube') {
       console.warn("Missing GOOGLE_CLIENT_ID, using mock auth");
       url = `http://localhost:3000/api/auth/mock/${platform}?state=${state}`;
    }

    return { url, state };
  },

  // Handle callback and store account in DB
  async handleCallback(platform: string, code: string, state: string) {
    // 1. Exchange code for tokens (Real implementation would use axios to post to provider)
    let accessToken = `mock_access_token_${Date.now()}`;
    let refreshToken = `mock_refresh_token_${Date.now()}`;
    let profile = {
      id: `user_${Date.now()}`,
      name: 'Simulated User',
      email: 'user@example.com',
      avatar: `https://ui-avatars.com/api/?name=${platform}&background=random`
    };

    // NOTE: In a real app, you would make the API call here:
    // if (platform === 'youtube') {
    //   const { data } = await axios.post('https://oauth2.googleapis.com/token', { ... });
    //   accessToken = data.access_token;
    //   // Fetch user profile...
    // }

    // Mocking user ID for simplicity as we don't have a login screen yet
    const userId = 'default-dev-user-id';

    // 2. Ensure User exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: 'Developer',
        email: 'dev@streamforge.com'
      }
    });

    // 3. Save/Update account to DB
    const account = await prisma.account.create({
      data: {
        userId,
        platform,
        username: profile.name,
        avatarUrl: profile.avatar,
        accessToken: accessToken, 
        refreshToken: refreshToken, 
        status: 'connected',
        isDestination: true,
        isSource: true
      }
    });

    return account;
  },

  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: { userId }
    });
  }
};
