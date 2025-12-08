import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config.ts';

// Ensure ffmpeg path is set if not in PATH
// ffmpeg.setFfmpegPath(config.ffmpegPath);

export const ffmpegService = {
  startStreamRelay(sourceUrl: string, destinations: string[]) {
    console.log(`Starting relay from ${sourceUrl} to ${destinations.length} destinations`);

    const command = ffmpeg(sourceUrl)
      .inputOptions([
        '-re', // Read input at native frame rate
        '-stream_loop -1' // Loop if it's a file
      ])
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-f flv',
        '-preset veryfast',
        '-maxrate 3000k',
        '-bufsize 6000k',
        '-g 50' // Keyframe interval
      ]);

    // Add multiple outputs for destinations (tee muxer or separate processes)
    // Simplified for MVP: Pushing to first destination
    if (destinations.length > 0) {
      command.output(destinations[0]);
    }

    command.on('start', (cmd) => {
      console.log('FFmpeg process started:', cmd);
    });

    command.on('error', (err) => {
      console.error('FFmpeg error:', err.message);
    });

    command.on('end', () => {
      console.log('FFmpeg process ended');
    });

    // command.run(); // Uncomment to actually run if ffmpeg is installed
    return command;
  }
};