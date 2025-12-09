import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProfilePanel } from './components/ProfilePanel';
import { Studio } from './components/Studio';
import { Menubar } from './components/Menubar';
import { AddSourceModal } from './components/AddSourceModal';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { StreamConfigModal } from './components/StreamConfigModal';
import { SourcePropertiesModal } from './components/SourcePropertiesModal';
import { DestinationsView, AccountsView, AnalyticsView, SettingsView, PlaceholderView } from './components/Views';
import { INITIAL_SCENES } from './constants';
import { Account, Scene, StreamState, StreamMetrics, PlatformType, Source } from './types';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { io } from 'socket.io-client';

const generateId = () => Math.random().toString(36).substr(2, 9);
const socket = io('http://localhost:3000'); // Connect to backend

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>('');
  
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [activeSceneId, setActiveSceneId] = useState<string>(INITIAL_SCENES[0].id);
  const [streamState, setStreamState] = useState<StreamState>(StreamState.IDLE);
  const [isRecording, setIsRecording] = useState(false);
  const [isVirtualCamActive, setIsVirtualCamActive] = useState(false);
  const [isStudioMode, setIsStudioMode] = useState(false);
  
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [isConnectAccountModalOpen, setIsConnectAccountModalOpen] = useState(false);
  const [isStreamConfigModalOpen, setIsStreamConfigModalOpen] = useState(false);
  const [isAddSceneModalOpen, setIsAddSceneModalOpen] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [metrics, setMetrics] = useState<StreamMetrics>({ fps: 60, cpuUsage: 12, bitrate: 0, droppedFrames: 0, viewers: 0, duration: 0 });

  const streamSocketRef = useRef<any>(null);
  const activeAccount = accounts.find(a => a.id === activeAccountId) || null;
  const currentScene = scenes.find(s => s.id === activeSceneId) || null;

  useEffect(() => {
    fetch('/api/health').catch(e => console.warn("Backend down"));
    fetchAccounts();

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AUTH_SUCCESS') {
        fetchAccounts();
        setIsConnectAccountModalOpen(false);
      }
    };
    window.addEventListener('message', handleAuthMessage);
    
    streamSocketRef.current = socket;
    socket.on('connect', () => console.log('Socket connected'));

    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length > 0 && !activeAccountId) setActiveAccountId(data[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const handleRemoveAccount = async (id: string) => {
    if(!confirm("Are you sure you want to remove this account?")) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      fetchAccounts();
      if (activeAccountId === id) setActiveAccountId('');
    } catch (e) { console.error(e); }
  };

  const handleConfirmStartStream = async (selectedAccountIds: string[]) => {
    setStreamState(StreamState.STARTING);
    
    // Check for remote source to Relay, otherwise Ingest (Webcam/Screen)
    const remoteSource = currentScene?.sources.find(s => s.type === 'remote_url' && s.visible);
    const sourceUrl = remoteSource?.config.url || '';
    const mode = sourceUrl ? 'relay' : 'ingest';

    const destinations = accounts
      .filter(acc => selectedAccountIds.includes(acc.id))
      .map(acc => {
        // Construct RTMP URL. If custom, we have full URL+Key. If OAuth, we might need to fetch ingest from platform (not implemented fully here, fallback to stored)
        // For Custom RTMP: acc.rtmpUrl should be valid.
        // For OAuth: You'd typically call platform API to get ingestion point. Here we assume we stored it or use a mock.
        return acc.rtmpUrl && acc.streamKey ? `${acc.rtmpUrl}/${acc.streamKey}` : acc.rtmpUrl ? acc.rtmpUrl : `rtmp://localhost/live/${acc.platform}`;
      });

    try {
      const res = await fetch('/api/stream/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl, destinations, mode })
      });
      
      if (res.ok) {
        setStreamState(StreamState.LIVE);
      } else {
        setStreamState(StreamState.IDLE);
        alert("Failed to start stream.");
      }
    } catch (err) {
      console.error(err);
      setStreamState(StreamState.IDLE);
    }
  };

  // Called by Studio when streaming is active to send video data chunks
  const handleStreamDataAvailable = (data: Blob) => {
    if (streamSocketRef.current) {
      streamSocketRef.current.emit('stream_data', data);
    }
  };

  const handleStreamToggle = () => {
    if (streamState === StreamState.LIVE) {
       fetch('/api/stream/stop', { method: 'POST' });
       setStreamState(StreamState.IDLE);
    } else {
      setIsStreamConfigModalOpen(true);
    }
  };

  const handleConnectAccount = async (platform: PlatformType, data?: any) => {
    if (platform === 'custom_rtmp') {
      // Simulate save
      const newAcc: Account = {
        id: generateId(),
        platform,
        username: data?.name || 'Custom RTMP',
        avatarUrl: 'https://ui-avatars.com/api/?name=RTMP&background=orange&color=fff',
        status: 'connected',
        isDestination: true,
        isSource: true,
        rtmpUrl: data.url,
        streamKey: data.key
      };
      // In real app, POST to backend to save
      // For now, local update + mock fetch reload would be needed or just push to state
      setAccounts(prev => [...prev, newAcc]);
      return;
    }
    const res = await fetch(`/api/auth/${platform}/url`);
    const { url } = await res.json();
    window.open(url, 'Auth', 'width=600,height=700');
  };

  // Basic Handlers
  const handleAddScene = () => { if(newSceneName.trim()) { setScenes([...scenes, {id: generateId(), name: newSceneName, sources: []}]); setIsAddSceneModalOpen(false); } };
  const handleRemoveScene = (id: string) => setScenes(s => s.filter(x => x.id !== id));
  const handleAddSource = (data: any) => { 
    if(!currentScene) return;
    const newSrc = { ...data, id: generateId(), visible: true, config: { ...data.config, muted: false, volume: 100 } };
    setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, sources: [newSrc, ...s.sources] } : s));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'scenes':
      case 'sources':
      case 'mixer':
        return <Studio 
          currentScene={currentScene} scenes={scenes} streamState={streamState} metrics={metrics} 
          isRecording={isRecording} isVirtualCamActive={isVirtualCamActive} isStudioMode={isStudioMode}
          onStreamAction={handleStreamToggle} onStreamDataAvailable={handleStreamDataAvailable}
          onRecordAction={setIsRecording} onVirtualCamAction={() => setIsVirtualCamActive(!isVirtualCamActive)}
          onStudioModeAction={() => setIsStudioMode(!isStudioMode)} onSceneSelect={setActiveSceneId}
          onAddScene={() => setIsAddSceneModalOpen(true)} onRemoveScene={handleRemoveScene}
          onMoveScene={() => {}} onAddSource={() => setIsAddSourceModalOpen(true)}
          onRemoveSource={(sid, id) => setScenes(prev => prev.map(s => s.id === sid ? {...s, sources: s.sources.filter(x => x.id !== id)} : s))}
          onMoveSource={() => {}} onEditSource={setEditingSource} onToggleMute={() => {}} onToggleSourceVisibility={(sid, id) => setScenes(prev => prev.map(s => s.id === sid ? {...s, sources: s.sources.map(src => src.id === id ? {...src, visible: !src.visible} : src)} : s))}
        />;
      case 'accounts': return <AccountsView accounts={accounts} onAddAccount={() => setIsConnectAccountModalOpen(true)} onRemoveAccount={handleRemoveAccount} />;
      case 'multistream': return <DestinationsView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <PlaceholderView title={activeTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden selection:bg-indigo-500/30">
      <Menubar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderContent()}
        <ProfilePanel 
          activeAccount={activeAccount} accounts={accounts} streamState={streamState} 
          onSwitchAccount={setActiveAccountId} onAddAccount={() => setIsConnectAccountModalOpen(true)}
          onLogout={() => { setActiveAccountId(''); alert("Logged out."); }}
          onSettings={() => setActiveTab('settings')}
        />
      </div>
      <AddSourceModal isOpen={isAddSourceModalOpen} onClose={() => setIsAddSourceModalOpen(false)} onAdd={handleAddSource} />
      <ConnectAccountModal isOpen={isConnectAccountModalOpen} onClose={() => setIsConnectAccountModalOpen(false)} onConnect={handleConnectAccount} />
      <StreamConfigModal isOpen={isStreamConfigModalOpen} onClose={() => setIsStreamConfigModalOpen(false)} accounts={accounts} onConfirm={handleConfirmStartStream} />
      <SourcePropertiesModal isOpen={!!editingSource} onClose={() => setEditingSource(null)} source={editingSource} onUpdate={(u) => setScenes(prev => prev.map(s => ({...s, sources: s.sources.map(src => src.id === u.id ? u : src)})))} />
      <Modal isOpen={isAddSceneModalOpen} onClose={() => setIsAddSceneModalOpen(false)} title="New Scene">
        <div className="space-y-4">
          <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" value={newSceneName} onChange={e => setNewSceneName(e.target.value)} placeholder="Scene Name" />
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAddSceneModalOpen(false)}>Cancel</Button><Button onClick={handleAddScene}>Create</Button></div>
        </div>
      </Modal>
    </div>
  );
}