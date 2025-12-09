import { ffmpegService } from '../services/ffmpeg.service.ts';

export const streamController = {
  async startStream(req: any, res: any) {
    const { sourceUrl, destinations, mode } = req.body;
    
    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({ error: 'At least one destination is required' });
    }

    try {
      if (mode === 'ingest') {
        // Start waiting for socket data
        ffmpegService.startStreamIngest(destinations);
        return res.json({ 
          success: true, 
          message: 'Ingest server ready. Please start sending data via socket.',
          mode: 'ingest'
        });
      } else {
        // Default Relay Mode
        if (!sourceUrl) return res.status(400).json({ error: 'Source URL required for relay mode' });
        
        ffmpegService.startStreamRelay(sourceUrl, destinations);
        return res.json({ 
          success: true, 
          message: `Relay started to ${destinations.length} destinations`,
          mode: 'relay'
        });
      }
    } catch (error: any) {
      console.error("Stream Start Error:", error);
      return res.status(500).json({ success: false, error: 'Failed to start stream', details: error.message });
    }
  },

  async stopStream(req: any, res: any) {
    try {
      const wasRunning = ffmpegService.stopStream();
      return res.json({ success: true, message: wasRunning ? 'Stream stopped' : 'No stream running' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Failed to stop stream', details: error.message });
    }
  },

  async getIngestConfig(req: any, res: any) {
    res.json({
      rtmpUrl: 'rtmp://ingest.streamforge.com/live',
      streamKey: 'live_user_key_12345'
    });
  }
};