
import { Account, Scene } from "./types";

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_1',
    platform: 'twitch',
    username: 'StreamGamerPro',
    avatarUrl: 'https://picsum.photos/id/64/100/100',
    status: 'connected',
    isDestination: true,
    isSource: true
  },
  {
    id: 'acc_2',
    platform: 'youtube',
    username: 'TechDaily',
    avatarUrl: 'https://picsum.photos/id/1005/100/100',
    status: 'connected',
    isDestination: true,
    isSource: true
  }
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'scene_1',
    name: 'Just Chatting',
    sources: [
      {
        id: 'src_1',
        name: 'Webcam Main',
        type: 'webcam',
        config: { volume: 100 },
        isAuthenticated: true,
        visible: true
      },
      {
        id: 'src_2',
        name: 'Alert Box',
        type: 'image',
        config: { url: 'https://picsum.photos/id/200/200/100' },
        isAuthenticated: true,
        visible: true
      }
    ]
  },
  {
    id: 'scene_2',
    name: 'Gaming',
    sources: [
      {
        id: 'src_3',
        name: 'Game Capture',
        type: 'screen',
        config: { volume: 80 },
        isAuthenticated: true,
        visible: true
      },
      {
        id: 'src_4',
        name: 'Webcam Small',
        type: 'webcam',
        config: { volume: 0 },
        isAuthenticated: true,
        visible: true
      }
    ]
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Welcome', message: 'Ready to start streaming.', type: 'info', timestamp: Date.now() }
];
