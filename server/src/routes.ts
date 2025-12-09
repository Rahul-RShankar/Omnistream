import express from 'express';
import { authController } from './controllers/auth.controller.ts';
import { streamController } from './controllers/stream.controller.ts';

export const router = express.Router();

// Auth Routes
router.get('/auth/:platform/url', authController.getLoginUrl);
router.get('/auth/:platform/callback', authController.callback);
router.get('/auth/mock/:platform', authController.mockCallback);

// Account Routes
router.get('/accounts', authController.getUserAccounts);
router.delete('/accounts/:id', authController.removeAccount);

// Stream Routes
router.post('/stream/start', streamController.startStream);
router.post('/stream/stop', streamController.stopStream);
router.get('/stream/ingest', streamController.getIngestConfig);

// Health Check
router.get('/health', (req, res) => { res.json({ status: 'ok', timestamp: Date.now() }) });