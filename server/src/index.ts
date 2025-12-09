import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { router } from './routes.ts';
import { config } from './config.ts';
import { ffmpegService } from './services/ffmpeg.service.ts';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8 // 100MB buffer just in case
});

app.use(cors() as any);
app.use(express.json() as any);
app.use('/api', router);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_stream_room', (streamId) => {
    socket.join(streamId);
    console.log(`Socket ${socket.id} joined room ${streamId}`);
  });

  // Handle binary video chunks from frontend
  socket.on('stream_data', (data) => {
    // console.log(`Received stream chunk: ${data.length} bytes`); // Uncomment for debug
    ffmpegService.writeToStream(data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(config.port, () => {
  console.log(`Backend server running on http://localhost:${config.port}`);
  console.log(`API available at http://localhost:${config.port}/api`);
});