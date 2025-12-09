import { authService } from '../services/auth.service.ts';
import { prisma } from '../db.ts';

export const authController = {
  async getLoginUrl(req: any, res: any) {
    const { platform } = req.params;
    try {
      const result = await authService.getOAuthUrl(platform);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to get auth URL' });
    }
  },

  async mockCallback(req: any, res: any) {
    const { platform } = req.params;
    const { state } = req.query;
    res.redirect(`/api/auth/${platform}/callback?code=mock_code_123&state=${state}`);
  },

  async callback(req: any, res: any) {
    const { platform } = req.params;
    const { code, state } = req.query;

    try {
      const account = await authService.handleCallback(platform, code as string, state as string);
      const html = `
        <!DOCTYPE html><html><head><title>Auth Success</title></head><body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'AUTH_SUCCESS', account: ${JSON.stringify(account)} }, '*');
              window.close();
            } else { document.body.innerHTML = 'Authentication successful. You can close this window.'; }
          </script>
        </body></html>`;
      res.send(html);
    } catch (error) {
      console.error(error);
      res.status(500).send('Authentication failed');
    }
  },

  async getUserAccounts(req: any, res: any) {
    const userId = 'default-dev-user-id';
    try {
      const accounts = await authService.getAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  },

  async removeAccount(req: any, res: any) {
    const { id } = req.params;
    try {
      if ((prisma as any).account.delete) {
         await prisma.account.delete({ where: { id } });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete failed", error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
};