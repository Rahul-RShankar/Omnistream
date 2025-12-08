
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProfilePanel } from './components/ProfilePanel';
import { Studio } from './components/Studio';
import { Menubar } from './components/Menubar';
import { AddSourceModal } from './components/AddSourceModal';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { SourcePropertiesModal } from './components/SourcePropertiesModal';
import { DestinationsView, AccountsView, AnalyticsView, SettingsView, PlaceholderView } from './components/Views';
import { INITIAL_ACCOUNTS, INITIAL_SCENES } from './constants';
import { Account, Scene, StreamState, StreamMetrics, PlatformType, Source } from './types';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [activeAccountId, setActiveAccountId] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [activeSceneId, setActiveSceneId] = useState<string>(INITIAL_SCENES[0].id);
  const [streamState, setStreamState] = useState<StreamState>(StreamState.IDLE);
  const [isRecording, setIsRecording] = useState(false);
  const [isVirtualCamActive, setIsVirtualCamActive] = useState(false);
  const [isStudioMode, setIsStudioMode] = useState(false);
  
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [isConnectAccountModalOpen, setIsConnectAccountModalOpen] = useState(false);
  
  // Scene Creation Modal State
  const [isAddSceneModalOpen, setIsAddSceneModalOpen] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');

  // Source Properties State
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Backend Health
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Simulated Metrics
  const [metrics, setMetrics] = useState<StreamMetrics>({
    fps: 60,
    cpuUsage: 12,
    bitrate: 0,
    droppedFrames: 0,
    viewers: 0,
    duration: 0
  });

  const activeAccount = accounts.find(a => a.id === activeAccountId) || null;
  const currentScene = scenes.find(s => s.id === activeSceneId) || null;

  // Check Backend Connection
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        console.log("Backend connected:", data);
        setIsBackendConnected(true);
      })
      .catch(err => {
        console.warn("Backend not connected (running in client-only mode):", err);
      });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (streamState === StreamState.LIVE) {
      interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          bitrate: 4500 + Math.random() * 500, // fluctuate between 4500-5000
          cpuUsage: 15 + Math.random() * 5,
          viewers: prev.viewers + (Math.random() > 0.7 ? 1 : 0),
          duration: prev.duration + 1
        }));
      }, 1000);
    } else {
      setMetrics(prev => ({ ...prev, bitrate: 0, viewers: 0, duration: 0 }));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [streamState]);

  // Hotkey Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Find source with this hotkey
      scenes.forEach(scene => {
        scene.sources.forEach(source => {
          if (source.hotkey === e.code) {
             e.preventDefault();
             handleToggleSourceVisibility(scene.id, source.id);
          }
        });
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes]);

  const handleStreamToggle = () => {
    if (streamState === StreamState.LIVE) {
      setStreamState(StreamState.ENDING);
      // In a real app, call /api/stream/stop here
      setTimeout(() => setStreamState(StreamState.IDLE), 1000);
    } else {
      setStreamState(StreamState.STARTING);
      // In a real app, call /api/stream/start here
      setTimeout(() => setStreamState(StreamState.LIVE), 1000);
    }
  };

  const handleRecordToggle = (recording: boolean) => {
    setIsRecording(recording);
  };

  const handleVirtualCamToggle = () => {
    setIsVirtualCamActive(!isVirtualCamActive);
  };

  const handleStudioModeToggle = () => {
    setIsStudioMode(!isStudioMode);
  };

  const handleOpenAddSceneModal = () => {
    setNewSceneName(`Scene ${scenes.length + 1}`);
    setIsAddSceneModalOpen(true);
  };

  const handleAddScene = () => {
    if (!newSceneName.trim()) return;
    
    const newScene: Scene = {
      id: generateId(),
      name: newSceneName,
      sources: []
    };
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
    setIsAddSceneModalOpen(false);
  };

  const handleRemoveScene = (sceneId: string) => {
    if (scenes.length <= 1) {
      return;
    }
    const newScenes = scenes.filter(s => s.id !== sceneId);
    setScenes(newScenes);
    if (activeSceneId === sceneId) {
      setActiveSceneId(newScenes[0].id);
    }
  };

  const handleMoveScene = (sceneId: string, direction: 'up' | 'down') => {
    setScenes(prev => {
      const idx = prev.findIndex(s => s.id === sceneId);
      if (idx === -1) return prev;
      const newScenes = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      
      if (swapIdx >= 0 && swapIdx < newScenes.length) {
        [newScenes[idx], newScenes[swapIdx]] = [newScenes[swapIdx], newScenes[idx]];
      }
      return newScenes;
    });
  };

  const handleAddSource = (sourceData: any) => {
    if (!currentScene) return;
    
    const newSource: Source = {
      ...sourceData,
      id: generateId(),
      visible: true,
      config: {
        ...sourceData.config,
        muted: false,
        volume: 100
      },
      filters: {
        noiseSuppression: true,
        echoCancellation: true,
        gain: 0,
        compressor: false
      }
    };

    setScenes(prev => prev.map(scene => {
      if (scene.id === currentScene.id) {
        return {
          ...scene,
          sources: [newSource, ...scene.sources] // Add to top
        };
      }
      return scene;
    }));
  };

  const handleRemoveSource = (sceneId: string, sourceId: string) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          sources: scene.sources.filter(s => s.id !== sourceId)
        };
      }
      return scene;
    }));
  };

  const handleMoveSource = (sceneId: string, sourceId: string, direction: 'up' | 'down') => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === sceneId) {
        const idx = scene.sources.findIndex(s => s.id === sourceId);
        if (idx === -1) return scene;
        const newSources = [...scene.sources];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        
        if (swapIdx >= 0 && swapIdx < newSources.length) {
          [newSources[idx], newSources[swapIdx]] = [newSources[swapIdx], newSources[idx]];
        }
        return { ...scene, sources: newSources };
      }
      return scene;
    }));
  };

  const handleUpdateSource = (updatedSource: Source) => {
    setScenes(prev => prev.map(scene => ({
      ...scene,
      sources: scene.sources.map(s => s.id === updatedSource.id ? updatedSource : s)
    })));
  };

  const handleToggleMute = (sceneId: string, sourceId: string) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          sources: scene.sources.map(s => {
            if (s.id === sourceId) {
              return {
                 ...s,
                 config: { ...s.config, muted: !s.config.muted }
              };
            }
            return s;
          })
        };
      }
      return scene;
    }));
  };

  const handleToggleSourceVisibility = (sceneId: string, sourceId: string) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          sources: scene.sources.map(s => {
            if (s.id === sourceId) {
              return {
                 ...s,
                 visible: !s.visible
              };
            }
            return s;
          })
        };
      }
      return scene;
    }));
  };

  const handleConnectAccount = (platform: PlatformType, data?: any) => {
    let username = 'User';
    let avatarUrl = `https://picsum.photos/seed/${Math.random()}/100`;

    switch (platform) {
      case 'youtube': username = 'YouTube Creator'; break;
      case 'twitch': username = 'TwitchStreamer'; break;
      case 'facebook': username = 'FB User'; break;
      case 'instagram': username = 'Insta_Star'; break;
      case 'tiktok': username = 'TikToker_99'; break;
      case 'x': username = 'XUser'; break;
      case 'custom_rtmp': 
        username = data?.name || 'Custom Server'; 
        avatarUrl = 'https://ui-avatars.com/api/?name=RTMP&background=random';
        break;
    }

    const newAccount: Account = {
      id: generateId(),
      platform,
      username,
      avatarUrl,
      status: 'connected',
      isDestination: true,
      isSource: true,
      ...(platform === 'custom_rtmp' ? { rtmpUrl: data.url, streamKey: data.key } : {})
    };

    setAccounts(prev => [...prev, newAccount]);
    setActiveAccountId(newAccount.id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'scenes':
      case 'sources':
      case 'mixer':
        return (
          <Studio 
            currentScene={currentScene}
            scenes={scenes}
            streamState={streamState}
            metrics={metrics}
            isRecording={isRecording}
            isVirtualCamActive={isVirtualCamActive}
            isStudioMode={isStudioMode}
            onStreamAction={handleStreamToggle}
            onRecordAction={handleRecordToggle}
            onVirtualCamAction={handleVirtualCamToggle}
            onStudioModeAction={handleStudioModeToggle}
            onSceneSelect={setActiveSceneId}
            onAddScene={handleOpenAddSceneModal}
            onRemoveScene={handleRemoveScene}
            onMoveScene={handleMoveScene}
            onAddSource={() => setIsAddSourceModalOpen(true)}
            onRemoveSource={handleRemoveSource}
            onMoveSource={handleMoveSource}
            onEditSource={(source) => setEditingSource(source)}
            onToggleMute={handleToggleMute}
            onToggleSourceVisibility={handleToggleSourceVisibility}
          />
        );
      case 'multistream':
        return <DestinationsView />;
      case 'accounts':
        return <AccountsView accounts={accounts} onAddAccount={() => setIsConnectAccountModalOpen(true)} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PlaceholderView title={activeTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden selection:bg-indigo-500/30">
      <Menubar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {renderContent()}

        <ProfilePanel 
          activeAccount={activeAccount}
          accounts={accounts}
          streamState={streamState}
          onSwitchAccount={setActiveAccountId}
          onAddAccount={() => setIsConnectAccountModalOpen(true)}
        />
      </div>

      <AddSourceModal 
        isOpen={isAddSourceModalOpen} 
        onClose={() => setIsAddSourceModalOpen(false)}
        onAdd={handleAddSource}
      />

      <ConnectAccountModal
        isOpen={isConnectAccountModalOpen}
        onClose={() => setIsConnectAccountModalOpen(false)}
        onConnect={handleConnectAccount}
      />
      
      <SourcePropertiesModal
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        source={editingSource}
        onUpdate={handleUpdateSource}
      />

      {/* Add Scene Modal */}
      <Modal 
        isOpen={isAddSceneModalOpen} 
        onClose={() => setIsAddSceneModalOpen(false)}
        title="Add New Scene"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Scene Name</label>
            <input
              autoFocus
              type="text"
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddScene()}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={() => setIsAddSceneModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddScene}>Create Scene</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
