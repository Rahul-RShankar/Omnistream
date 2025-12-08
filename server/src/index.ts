import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { router } from './routes.ts';
import { config } from './config.ts';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors() as any);
app.use(express.json() as any);

// API Routes
app.use('/api', router);

// WebSocket Logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_stream_room', (streamId) => {
    socket.join(streamId);
    console.log(`Socket ${socket.id} joined room ${streamId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
httpServer.listen(config.port, () => {
  console.log(`Backend server running on http://localhost:${config.port}`);
  console.log(`API available at http://localhost:${config.port}/api`);
});