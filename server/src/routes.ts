import { Router } from 'express';
import { authController } from './controllers/auth.controller';
import { streamController } from './controllers/stream.controller';

export const router = Router();

// Auth Routes
router.get('/auth/:platform/url', authController.getLoginUrl);
router.get('/auth/:platform/callback', authController.callback);

// Stream Routes
router.post('/stream/start', streamController.startStream);
router.post('/stream/stop', streamController.stopStream);
router.get('/stream/ingest', streamController.getIngestConfig);

// Health Check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));
