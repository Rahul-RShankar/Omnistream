
export type SourceType = 'local_file' | 'remote_url' | 'webcam' | 'screen' | 'image' | 'audio_source';

export interface AudioFilters {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  gain: number; // dB
  compressor: boolean;
  noiseGate?: {
    enabled: boolean;
    threshold: number; // dB
    release: number; // ms
  };
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  config: {
    url?: string;
    file?: File;
    deviceId?: string;
    muted?: boolean;
    volume?: number; // 0-100
  };
  provider?: 'youtube' | 'twitch' | 'facebook' | 'generic';
  isAuthenticated?: boolean;
  visible: boolean;
  locked?: boolean;
  syncOffset?: number; // ms
  hotkey?: string; // key code
  filters?: AudioFilters;
}

export interface Scene {
  id: string;
  name: string;
  sources: Source[];
}

export type PlatformType = 'youtube' | 'twitch' | 'facebook' | 'instagram' | 'tiktok' | 'x' | 'custom_rtmp';

export interface Account {
  id: string;
  platform: PlatformType;
  username: string;
  avatarUrl: string;
  status: 'connected' | 'expired' | 'disconnected';
  isDestination: boolean;
  isSource: boolean;
  streamKey?: string;
  rtmpUrl?: string;
}

export interface StreamMetrics {
  fps: number;
  cpuUsage: number;
  bitrate: number; // kbps
  droppedFrames: number;
  viewers: number;
  duration: number; // seconds
}

export enum StreamState {
  IDLE = 'IDLE',
  STARTING = 'STARTING',
  LIVE = 'LIVE',
  ENDING = 'ENDING',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
}