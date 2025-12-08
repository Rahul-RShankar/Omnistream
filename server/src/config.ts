import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long!',
};
