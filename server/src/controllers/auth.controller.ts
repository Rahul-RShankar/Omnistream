import { authService } from '../services/auth.service.ts';

export const authController = {
  // Get the redirect URL for the frontend to open in a popup
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

  // Mock endpoint for development without real keys
  async mockCallback(req: any, res: any) {
    const { platform } = req.params;
    const { state } = req.query;
    // Redirect to the real callback handler with a fake code
    res.redirect(`/api/auth/${platform}/callback?code=mock_code_123&state=${state}`);
  },

  // Handle the redirect from the provider
  async callback(req: any, res: any) {
    const { platform } = req.params;
    const { code, state } = req.query;

    try {
      const account = await authService.handleCallback(platform, code as string, state as string);
      
      // Respond with an HTML page that posts the data back to the main window and closes itself
      const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Auth Success</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'AUTH_SUCCESS', account: ${JSON.stringify(account)} }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication successful. You can close this window.';
            }
          </script>
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Authentication Successful</h2>
            <p>Closing window...</p>
          </div>
        </body>
        </html>
      `;
      res.send(html);
    } catch (error) {
      console.error(error);
      res.status(500).send('Authentication failed');
    }
  },

  async getUserAccounts(req: any, res: any) {
    // In real app, extract userId from JWT in headers
    const userId = 'default-dev-user-id';
    try {
      const accounts = await authService.getAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }
};
