import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { config } from '../config.ts';

// Ensure ffmpeg path is set if not in PATH
// ffmpeg.setFfmpegPath(config.ffmpegPath);

let activeCommand: ffmpeg.FfmpegCommand | null = null;
let activeInputStream: PassThrough | null = null;

export const ffmpegService = {
  startStreamRelay(sourceUrl: string, destinations: string[]) {
    this.stopStream();

    console.log(`Starting relay from ${sourceUrl} to ${destinations.length} destinations`);

    if (destinations.length === 0) throw new Error("No destinations provided");

    const command = ffmpeg(sourceUrl)
      .inputOptions(['-re', '-stream_loop -1'])
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(['-preset veryfast', '-g 60', '-sc_threshold 0', '-b:v 3000k', '-maxrate 3000k', '-bufsize 6000k', '-pix_fmt yuv420p']);

    destinations.forEach(destUrl => command.output(destUrl).format('flv'));

    command.on('start', (cmdLine) => console.log('FFmpeg relay started:', cmdLine));
    command.on('error', (err) => console.error('FFmpeg error:', err.message));
    command.on('end', () => { console.log('FFmpeg process ended'); activeCommand = null; });

    command.run();
    activeCommand = command;
    return command;
  },

  startStreamIngest(destinations: string[]) {
    this.stopStream();

    console.log(`Starting INGEST stream to ${destinations.length} destinations`);
    if (destinations.length === 0) throw new Error("No destinations provided");

    // Create a PassThrough stream to write binary data into
    activeInputStream = new PassThrough();

    const command = ffmpeg(activeInputStream)
      .inputFormat('webm') // Browsers usually send webm via MediaRecorder
      .inputOptions(['-re']) // Realtime reading
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset ultrafast', 
        '-tune zerolatency',
        '-g 30',
        '-b:v 2500k', 
        '-pix_fmt yuv420p',
        '-flvflags no_duration_filesize'
      ]);

    destinations.forEach(destUrl => command.output(destUrl).format('flv'));

    command.on('start', (cmdLine) => console.log('FFmpeg INGEST started:', cmdLine));
    command.on('error', (err) => console.error('FFmpeg INGEST error:', err.message));
    command.on('end', () => { console.log('FFmpeg INGEST ended'); activeCommand = null; activeInputStream = null; });

    command.run();
    activeCommand = command;
    return command;
  },

  writeToStream(data: Buffer) {
    if (activeInputStream && !activeInputStream.destroyed) {
      activeInputStream.write(data);
    } else {
      // console.warn("Received data but no active input stream");
    }
  },

  stopStream() {
    if (activeCommand) {
      console.log('Stopping active stream...');
      try { activeCommand.kill('SIGKILL'); } catch (e) { console.error('Error killing FFmpeg:', e); }
      activeCommand = null;
    }
    if (activeInputStream) {
      activeInputStream.end();
      activeInputStream = null;
    }
    return true;
  }
};