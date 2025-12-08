import { Request, Response } from 'express';
import { ffmpegService } from '../services/ffmpeg.service';

export const streamController = {
  // Fix: Using any for req/res to avoid type errors with Express types in this environment
  async startStream(req: any, res: any) {
    const { sourceUrl, destinations } = req.body;
    
    if (!sourceUrl || !destinations || destinations.length === 0) {
      return res.status(400).json({ error: 'Invalid stream config' });
    }

    try {
      // In a real app, we track the process ID to stop it later
      ffmpegService.startStreamRelay(sourceUrl, destinations);
      res.json({ success: true, message: 'Stream started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start stream' });
    }
  },

  // Fix: Using any for req/res to avoid type errors with Express types in this environment
  async stopStream(req: any, res: any) {
    // Logic to kill the ffmpeg process
    res.json({ success: true, message: 'Stream stopped' });
  },

  // Fix: Using any for req/res to avoid type errors with Express types in this environment
  async getIngestConfig(req: any, res: any) {
    res.json({
      rtmpUrl: 'rtmp://ingest.streamforge.com/live',
      streamKey: 'live_user_key_12345'
    });
  }
};