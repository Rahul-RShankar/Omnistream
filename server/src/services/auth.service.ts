import { prisma } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface OAuthProfile {
  id: string;
  name: string;
  email: string | null;
  avatar: string;
  accessToken: string;
  refreshToken?: string;
}

export const authService = {
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
        url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=${googleScope}&access_type=offline&prompt=consent&state=${state}`;
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
        url = `http://localhost:3000/api/auth/mock/${platform}?state=${state}`;
    }

    if (platform === 'youtube' && (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes('your_google'))) {
       return { url: `http://localhost:3000/api/auth/mock/${platform}?state=${state}`, state };
    }

    return { url, state };
  },

  async handleCallback(platform: string, code: string, state: string) {
    let profile: OAuthProfile | null = null;

    try {
      if (platform === 'youtube' && !code.startsWith('mock')) {
        profile = await this.exchangeGoogleToken(code);
      } else if (platform === 'twitch' && !code.startsWith('mock')) {
        profile = await this.exchangeTwitchToken(code);
      } else if (platform === 'facebook' && !code.startsWith('mock')) {
        profile = await this.exchangeFacebookToken(code);
      } else {
        // IMPROVED MOCK FALLBACK NAMES
        const randomId = Math.floor(Math.random() * 1000);
        const prefixes = ['Pro', 'Super', 'The', 'Daily', 'Live'];
        const suffixes = ['Gamer', 'Streamer', 'Vlogger', 'Caster', 'TV'];
        const mockName = `${prefixes[Math.floor(Math.random()*prefixes.length)]}${suffixes[Math.floor(Math.random()*suffixes.length)]}_${randomId}`;
        
        profile = {
          id: `mock_user_${randomId}`,
          name: mockName,
          email: `user${randomId}@example.com`,
          avatar: `https://ui-avatars.com/api/?name=${mockName}&background=random&length=1`,
          accessToken: `mock_access_token_${Date.now()}`
        };
      }
    } catch (error) {
      console.error(`Error exchanging token for ${platform}:`, error);
      const randomId = Math.floor(Math.random() * 1000);
      profile = {
        id: `fallback_user_${Date.now()}`,
        name: `Simulated ${platform} User`,
        email: 'dev@error.com',
        avatar: `https://ui-avatars.com/api/?name=Error&background=ff0000`,
        accessToken: 'invalid'
      };
    }

    if (!profile) throw new Error('Failed to retrieve profile');

    const userId = 'default-dev-user-id';

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: 'Streamer',
        email: profile.email || `streamer-${Date.now()}@local.dev`
      }
    });

    const existingAccounts = await prisma.account.findMany({
      where: { userId, platform, username: profile.name } 
    });

    let account;
    if (existingAccounts.length > 0) {
      account = await prisma.account.update({
        where: { id: existingAccounts[0].id },
        data: {
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken || existingAccounts[0].refreshToken,
          avatarUrl: profile.avatar,
          status: 'connected',
          updatedAt: new Date()
        }
      });
    } else {
      account = await prisma.account.create({
        data: {
          userId,
          platform,
          username: profile.name,
          avatarUrl: profile.avatar,
          accessToken: profile.accessToken, 
          refreshToken: profile.refreshToken, 
          status: 'connected',
          isDestination: true,
          isSource: true
        }
      });
    }

    return account;
  },

  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: { userId }
    });
  },

  async exchangeGoogleToken(code: string): Promise<OAuthProfile> {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL
    });

    const { access_token, refresh_token } = tokenRes.data;
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    return {
      id: userRes.data.id,
      name: userRes.data.name,
      email: userRes.data.email,
      avatar: userRes.data.picture,
      accessToken: access_token,
      refreshToken: refresh_token
    };
  },

  async exchangeTwitchToken(code: string): Promise<OAuthProfile> {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITCH_CALLBACK_URL
      }
    });

    const { access_token, refresh_token } = tokenRes.data;
    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: { 
        Authorization: `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    });

    const user = userRes.data.data[0];

    return {
      id: user.id,
      name: user.display_name,
      email: user.email,
      avatar: user.profile_image_url,
      accessToken: access_token,
      refreshToken: refresh_token
    };
  },

  async exchangeFacebookToken(code: string): Promise<OAuthProfile> {
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
        code
      }
    });

    const { access_token } = tokenRes.data;
    const userRes = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token
      }
    });

    return {
      id: userRes.data.id,
      name: userRes.data.name,
      email: userRes.data.email,
      avatar: userRes.data.picture?.data?.url,
      accessToken: access_token
    };
  }
};