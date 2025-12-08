import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  // Fix: Using any for req/res to avoid type errors with Express types in this environment
  async getLoginUrl(req: any, res: any) {
    const { platform } = req.params;
    try {
      const result = await authService.getOAuthUrl(platform);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get auth URL' });
    }
  },

  // Fix: Using any for req/res to avoid type errors with Express types in this environment
  async callback(req: any, res: any) {
    const { platform } = req.params;
    const { code } = req.query;
    // Mock user ID for demo
    const userId = 'demo-user-id'; 

    try {
      const account = await authService.handleCallback(platform, code as string, userId);
      res.json({ success: true, account });
    } catch (error) {
      res.status(500).json({ error: 'Auth callback failed' });
    }
  }
};