
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Mic, 
  MicOff,
  Monitor, 
  Plus, 
  Trash2,
  Maximize,
  AlertTriangle,
  Camera,
  Layers,
  Video,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Settings,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Zap,
  Sliders,
  SplitSquareHorizontal,
  Aperture,
  ArrowRightLeft
} from 'lucide-react';
import { Scene, Source, StreamMetrics, StreamState } from '../types';
import { Button } from './ui/Button';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StudioProps {
  currentScene: Scene | null;
  scenes: Scene[];
  streamState: StreamState;
  isRecording: boolean;
  isVirtualCamActive: boolean;
  isStudioMode: boolean;
  metrics: StreamMetrics;
  onStreamAction: () => void;
  onRecordAction: (isRecording: boolean) => void;
  onVirtualCamAction: () => void;
  onStudioModeAction: () => void;
  onSceneSelect: (sceneId: string) => void;
  onAddScene: () => void;
  onRemoveScene: (sceneId: string) => void;
  onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
  onAddSource: (sceneId: string) => void;
  onRemoveSource: (sceneId: string, sourceId: string) => void;
  onMoveSource: (sceneId: string, sourceId: string, direction: 'up' | 'down') => void;
  onEditSource: (source: Source) => void;
  onToggleMute: (sceneId: string, sourceId: string) => void;
  onToggleSourceVisibility: (sceneId: string, sourceId: string) => void;
}

// Sub-component to handle individual source rendering logic
const SourceRenderer: React.FC<{ 
  source: Source; 
  index: number; 
  onStreamReady: (id: string, stream: MediaStream) => void;
}> = ({ source, index, onStreamReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = source.config.muted || false;
    if (audioRef.current) audioRef.current.muted = source.config.muted || false;
  }, [source.config.muted]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current && audioRef.current.srcObject) {
        const stream = audioRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const initStream = async () => {
      setError(null);
      if (!videoRef.current && !audioRef.current) return;
      if (!source.visible) return;

      try {
        if (source.type === 'webcam') {
          try {
            const constraints: MediaStreamConstraints = {
              video: true,
              audio: {
                echoCancellation: source.filters?.echoCancellation ?? true,
                noiseSuppression: source.filters?.noiseSuppression ?? true,
                autoGainControl: true,
              }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.muted = true; // Always mute local preview
            }
            onStreamReady(source.id, stream);
          } catch (err: any) {
            console.error("Webcam Error:", err);
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
              if (videoRef.current) videoRef.current.srcObject = stream;
              onStreamReady(source.id, stream);
            } catch (fallbackErr) {
               throw err;
            }
          }
        } else if (source.type === 'audio_source') {
           try {
             const stream = await navigator.mediaDevices.getUserMedia({ 
               audio: {
                 echoCancellation: source.filters?.echoCancellation ?? true,
                 noiseSuppression: source.filters?.noiseSuppression ?? true,
                 autoGainControl: true
               }, 
               video: false 
             });
             if (audioRef.current) {
               audioRef.current.srcObject = stream;
               audioRef.current.muted = true; 
             }
             onStreamReady(source.id, stream);
           } catch (err: any) {
             throw new Error("Microphone access denied");
           }
        } else if (source.type === 'screen') {
          try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.muted = true;
            }
            onStreamReady(source.id, stream);
          } catch (err: any) {
             throw new Error("Screen share cancelled");
           }
        } else if (source.type === 'local_file') {
           if (source.config.file) {
             if (videoRef.current) {
               videoRef.current.src = URL.createObjectURL(source.config.file);
               videoRef.current.onerror = () => setError("Failed to play video file");
               videoRef.current.muted = source.config.muted || false;
             }
           } else {
             throw new Error("File not loaded");
           }
        }
      } catch (err: any) {
        setError(err.message || "Source unavailable");
      }
    };

    if (['webcam', 'screen', 'local_file', 'audio_source'].includes(source.type)) {
      initStream();
    }
  }, [source.type, source.config.file, source.id, source.visible, source.filters]);

  // If source is hidden, return null or placeholder
  if (!source.visible) return null;

  if (source.type === 'audio_source') {
    if (error) {
      return (
        <div className="absolute bottom-2 left-2 bg-red-900/80 text-white text-xs px-2 py-1 rounded border border-red-500 flex items-center z-50">
           <AlertTriangle size={12} className="mr-1"/> Mic Error
        </div>
      );
    }
    return <audio ref={audioRef} autoPlay />;
  }

  const style: React.CSSProperties = {
    zIndex: index,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  if (source.type === 'webcam' && index > 0) {
    style.width = '30%';
    style.height = '30%';
    style.top = 'auto';
    style.bottom = '20px';
    style.left = 'auto';
    style.right = '20px';
    style.border = '2px solid #6366f1';
    style.borderRadius = '8px';
    style.backgroundColor = '#000';
  }

  if (error) {
     return (
       <div style={style} className="bg-zinc-900 border-2 border-red-500/50 flex flex-col items-center justify-center text-red-400 p-4 animate-in fade-in duration-300">
          <div className="bg-red-500/10 p-3 rounded-full mb-3">
            <AlertTriangle size={32} />
          </div>
          <span className="font-semibold text-sm mb-1">{source.name} Error</span>
          <span className="text-xs text-red-300/80 text-center max-w-[200px]">{error}</span>
          {source.type === 'screen' && (
            <Button size="sm" variant="secondary" className="mt-4 text-xs" onClick={() => window.location.reload()}>Retry</Button>
          )}
       </div>
     );
  }

  if (source.type === 'remote_url' && source.provider === 'youtube' && source.config.url) {
    const videoIdMatch = source.config.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (videoId) {
      return (
        <div style={style} className="bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0`} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="pointer-events-none"
          />
        </div>
      );
    } else {
       return (
        <div style={style} className="bg-zinc-900 border-2 border-yellow-500/30 flex flex-col items-center justify-center text-yellow-500">
           <AlertTriangle size={32} className="mb-2 opacity-80"/>
           <span className="text-sm font-medium">Invalid YouTube URL</span>
        </div>
       );
    }
  }

  if (source.type === 'image' && source.config.url) {
    return (
      <img src={source.config.url} alt={source.name} style={style} className="object-cover" />
    );
  }

  if (source.type === 'local_file' && !source.config.file) {
    return (
      <div style={style} className="bg-zinc-900 flex items-center justify-center text-zinc-500">
         <div className="text-center">
            <Video size={48} className="mx-auto mb-2 opacity-50"/>
            <span>Local File Placeholder</span>
         </div>
      </div>
    );
  }

  return (
    <video 
      ref={videoRef} 
      style={style} 
      autoPlay 
      playsInline 
      muted 
      loop={source.type === 'local_file'}
      className="bg-black"
    />
  );
};


export const Studio: React.FC<StudioProps> = ({ 
  currentScene, 
  scenes, 
  streamState, 
  isRecording,
  isVirtualCamActive,
  isStudioMode,
  onStreamAction,
  onRecordAction,
  onVirtualCamAction,
  onStudioModeAction,
  metrics,
  onSceneSelect,
  onAddScene,
  onRemoveScene,
  onMoveScene,
  onAddSource,
  onRemoveSource,
  onMoveSource,
  onEditSource,
  onToggleMute,
  onToggleSourceVisibility
}) => {
  const [data, setData] = useState<any[]>([]);
  const [activeTransition, setActiveTransition] = useState('Fade');
  const activeStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Transition simulation
  const [displayScene, setDisplayScene] = useState<Scene | null>(null);
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), bitrate: metrics.bitrate }];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [metrics]);

  // Handle Scene Transitions
  useEffect(() => {
    // If studio mode is OFF, apply transition effects on the main view
    if (!isStudioMode) {
      let animClass = '';
      switch (activeTransition) {
        case 'Fade': animClass = 'animate-in fade-in duration-500'; break;
        case 'Slide': animClass = 'animate-in slide-in-from-right duration-500'; break;
        case 'Cut': default: animClass = ''; break;
      }
      setTransitionClass(animClass);
      
      // Small timeout to reset animation class logic if needed, 
      // but React key change on container handles the remount animation nicely.
      setDisplayScene(currentScene);
    } else {
      // In Studio Mode, 'Program' updates only when explicitly transitioned (mocked here by auto-updating for now unless we add a specific 'Transition' button logic)
      // For this MVP, we'll keep Program synced or implement a manual 'Transition' button later.
      // Currently, let's keep it synced to show the selected scene.
      setDisplayScene(currentScene);
    }
  }, [currentScene, activeTransition, isStudioMode]);

  const handleStreamReady = (id: string, stream: MediaStream) => {
    activeStreamsRef.current.set(id, stream);
  };

  const handleStartRecording = () => {
    const allStreams = Array.from(activeStreamsRef.current.values());
    const videoStream = allStreams.find(s => s.getVideoTracks().length > 0);
    const audioStream = allStreams.find(s => s.getAudioTracks().length > 0);

    let streamToRecord: MediaStream | null = null;

    if (videoStream) {
      streamToRecord = videoStream;
      if (audioStream && audioStream !== videoStream) {
        streamToRecord = new MediaStream([
           ...videoStream.getVideoTracks(), 
           ...audioStream.getAudioTracks()
        ]);
      }
    } else if (audioStream) {
       streamToRecord = audioStream;
    }

    if (streamToRecord) {
      try {
        const recorder = new MediaRecorder(streamToRecord, { 
          mimeType: 'video/webm;codecs=vp9,opus' 
        });
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style.display = 'none';
          a.href = url;
          a.download = `recording_${new Date().getTime()}.webm`;
          a.click();
          window.URL.revokeObjectURL(url);
          recordedChunksRef.current = [];
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        onRecordAction(true);
      } catch (e) {
        console.error("Recording failed", e);
        try {
           const recorder = new MediaRecorder(streamToRecord, { mimeType: 'video/webm' });
           recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
           recorder.onstop = () => { /* ... */ };
           recorder.start(1000);
           mediaRecorderRef.current = recorder;
           onRecordAction(true);
        } catch (e2) {
           alert("Failed to start recording. Please check browser permissions.");
        }
      }
    } else {
      console.warn("No valid media stream to record.");
      onRecordAction(true); 
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    onRecordAction(false);
  };

  const isLive = streamState === StreamState.LIVE;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'webcam': return <Camera size={14} className="mr-2 text-green-400"/>;
      case 'screen': return <Monitor size={14} className="mr-2 text-blue-400"/>;
      case 'local_file': return <Video size={14} className="mr-2 text-purple-400"/>;
      case 'image': return <ImageIcon size={14} className="mr-2 text-pink-400"/>;
      case 'audio_source': return <Mic size={14} className="mr-2 text-yellow-400"/>;
      default: return <Layers size={14} className="mr-2 text-zinc-400"/>;
    }
  };

  const renderCanvas = (label: string, scene: Scene | null, isPreview: boolean = false) => (
    <div className={`relative bg-black rounded-lg shadow-2xl border ${isPreview ? 'border-zinc-700' : 'border-red-900/50'} overflow-hidden group flex-1 flex flex-col`}>
       <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-medium uppercase tracking-wider">
         {label}
       </div>
       <div className="relative flex-1 bg-black overflow-hidden">
         {scene && (
           <div 
             key={scene.id} // Key ensures remount to trigger CSS animation
             className={`absolute inset-0 flex items-center justify-center bg-zinc-950 ${isPreview ? 'opacity-80 grayscale' : ''} ${!isPreview ? transitionClass : ''}`}
           >
             {scene.sources.length === 0 && (
                <div className="text-zinc-600 flex flex-col items-center animate-pulse">
                  <Monitor size={48} className="mb-2 opacity-20"/>
                </div>
             )}
             {scene.sources.map((src, idx) => (
               <SourceRenderer 
                 key={src.id} 
                 source={src} 
                 index={idx} 
                 onStreamReady={handleStreamReady}
               />
             ))}
           </div>
         )}
       </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col bg-zinc-900 overflow-hidden relative">
      <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shadow-sm z-10">
        <div className="flex items-center space-x-4">
           <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
             {metrics.fps} FPS
           </span>
           <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
             {metrics.cpuUsage.toFixed(1)}% CPU
           </span>
           <span className={`text-xs font-mono px-2 py-1 rounded border border-zinc-800 ${isLive ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-900'}`}>
             {isLive ? `${metrics.bitrate.toFixed(0)} kbps` : 'OFFLINE'}
           </span>
        </div>
        <div className="flex items-center space-x-2">
           <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider mr-2">{currentScene?.name || 'No Scene'}</span>
           <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"><Maximize size={14}/></Button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col bg-zinc-900/50 relative">
        <div className="flex-1 flex space-x-4 min-h-0">
          {/* Preview Canvas (Only in Studio Mode - shows currently selected scene) */}
          {isStudioMode && renderCanvas("Preview", currentScene, true)}
          
          {/* Transition Controls (Center in Studio Mode) */}
          {isStudioMode && (
             <div className="w-12 flex flex-col items-center justify-center space-y-4">
                <Button size="icon" variant="secondary" title="Transition"><ArrowRightLeft size={16}/></Button>
                <div className="w-0.5 h-full bg-zinc-800 my-2"></div>
                <div className="flex flex-col space-y-2">
                  <select 
                    className="bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-400 w-16 p-1 outline-none"
                    value={activeTransition}
                    onChange={(e) => setActiveTransition(e.target.value)}
                  >
                    <option value="Cut">Cut</option>
                    <option value="Fade">Fade</option>
                    <option value="Slide">Slide</option>
                  </select>
                </div>
             </div>
          )}

          {/* Program Canvas (Shows 'displayScene' which tracks currentScene with effects) */}
          {renderCanvas(isStudioMode ? "Program" : "Preview / Program", displayScene)}
        </div>
      </div>

      <div className="h-64 bg-zinc-950 border-t border-zinc-800 flex divide-x divide-zinc-800 shrink-0 select-none">
        
        {/* Scenes List */}
        <div className="w-56 flex flex-col">
          <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400 uppercase ml-2">Scenes</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {scenes.map(scene => (
              <div 
                key={scene.id}
                className={`group relative flex items-center justify-between px-3 py-1.5 text-sm rounded-sm cursor-pointer transition-colors ${
                  currentScene?.id === scene.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
                onClick={() => onSceneSelect(scene.id)}
              >
                <span className="truncate pr-2">{scene.name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveScene(scene.id);
                  }}
                  className={`p-1 rounded text-zinc-300 hover:text-red-400 hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity ${scenes.length <= 1 ? 'hidden' : ''}`}
                  title="Delete Scene"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-1 border-t border-zinc-800 bg-zinc-900/30 flex space-x-1">
            <Button variant="ghost" size="sm" className="flex-1 h-8" onClick={onAddScene} title="Add Scene"><Plus size={14}/></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => currentScene && onMoveScene(currentScene.id, 'up')}><ChevronUp size={14}/></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => currentScene && onMoveScene(currentScene.id, 'down')}><ChevronDown size={14}/></Button>
          </div>
        </div>

        {/* Sources List */}
        <div className="w-56 flex flex-col">
          <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
             <span className="text-xs font-bold text-zinc-400 uppercase ml-2">Sources</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {currentScene?.sources.map(source => (
              <div
                key={source.id}
                className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 group hover:border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                onDoubleClick={() => onEditSource(source)}
              >
                <div className="flex items-center truncate flex-1 min-w-0">
                   {getSourceIcon(source.type)}
                   <span className={`truncate ${!source.visible ? 'opacity-50 line-through' : ''}`} title={source.name}>{source.name}</span>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                   <button 
                    className="text-zinc-500 hover:text-zinc-300 p-0.5"
                    onClick={(e) => { e.stopPropagation(); onToggleSourceVisibility(currentScene.id, source.id); }}
                   >
                     {source.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onEditSource(source); }}
                     className="text-zinc-500 hover:text-indigo-400 p-0.5 hover:bg-indigo-400/10 rounded opacity-0 group-hover:opacity-100"
                     title="Properties"
                   >
                     <Settings size={14}/>
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onRemoveSource(currentScene.id, source.id); }}
                     className="text-zinc-500 hover:text-red-400 p-0.5 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100"
                     title="Remove Source"
                   >
                     <Trash2 size={14}/>
                   </button>
                </div>
              </div>
            ))}
             {currentScene && currentScene.sources.length === 0 && (
              <div className="p-8 flex flex-col items-center justify-center text-zinc-600">
                <Layers size={24} className="mb-2 opacity-50" />
                <span className="text-xs italic">No sources</span>
              </div>
            )}
          </div>
          <div className="p-1 border-t border-zinc-800 bg-zinc-900/30 flex space-x-1">
            <Button variant="ghost" size="sm" className="flex-1 h-8" onClick={() => currentScene && onAddSource(currentScene.id)} disabled={!currentScene}><Plus size={14}/></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => {}} title="Properties"><Settings size={14}/></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => {}}><ChevronUp size={14}/></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => {}}><ChevronDown size={14}/></Button>
          </div>
        </div>

        {/* Audio Mixer */}
        <div className="flex-1 flex flex-col min-w-[200px] border-r border-zinc-800">
           <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
             <span className="text-xs font-bold text-zinc-400 uppercase ml-2">Audio Mixer</span>
           </div>
           <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {currentScene?.sources
                .filter(s => ['webcam', 'audio_source', 'local_file', 'screen'].includes(s.type))
                .map((source, i) => (
                <div key={source.id} className="bg-zinc-900 p-2 rounded border border-zinc-800">
                  <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                    <span className="truncate max-w-[120px] font-medium">{source.name}</span>
                    <div className="flex space-x-1">
                      <button 
                        className="hover:text-white" 
                        title="Advanced Audio Properties"
                        onClick={() => onEditSource(source)}
                      >
                        <Settings size={12}/>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onToggleMute(currentScene.id, source.id)}
                      className={`${source.config.muted ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {source.config.muted ? <MicOff size={16} /> : <Mic size={16}/>}
                    </button>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative group">
                       {!source.config.muted && (
                         <div 
                           className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-80"
                           style={{ width: `${60 + Math.random() * 20}%` }}
                         />
                       )}
                       {source.filters?.noiseGate?.enabled && (
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-white z-10" 
                            style={{ left: `${(source.filters.noiseGate.threshold + 60) / 60 * 100}%` }}
                            title={`Gate Threshold: ${source.filters.noiseGate.threshold}dB`}
                          />
                       )}
                    </div>
                    <span className="text-[10px] text-zinc-500 w-6 text-right">-3dB</span>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Scene Transitions & Controls */}
        <div className="w-64 flex flex-col p-2 bg-zinc-900/20 space-y-2">
           {/* Transition Select (Visible when NOT in Studio Mode for quick access) */}
           {!isStudioMode && (
             <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Transition</span>
                <select 
                  className="bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-400 w-24 p-1 outline-none"
                  value={activeTransition}
                  onChange={(e) => setActiveTransition(e.target.value)}
                >
                  <option value="Cut">Cut</option>
                  <option value="Fade">Fade</option>
                  <option value="Slide">Slide</option>
                </select>
             </div>
           )}

           <div className="flex-1 flex flex-col space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase">Controls</h4>
              
              <Button 
               variant={isLive ? 'danger' : 'primary'} 
               size="sm"
               className="justify-start pl-3"
               onClick={onStreamAction}
             >
               {isLive ? <Square size={14} className="mr-2 fill-current"/> : <Zap size={14} className="mr-2 fill-current"/>}
               {isLive ? 'Stop Streaming' : 'Start Streaming'}
             </Button>

             <Button 
                variant={isRecording ? 'secondary' : 'secondary'} 
                size="sm"
                className={`justify-start pl-3 ${isRecording ? 'bg-red-500/10 text-red-500 border-red-900/50' : ''}`}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
               <div className={`w-2 h-2 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></div>
               {isRecording ? 'Stop Recording' : 'Start Recording'}
             </Button>

             <Button 
                variant={isVirtualCamActive ? 'primary' : 'secondary'} 
                size="sm"
                className="justify-start pl-3"
                onClick={onVirtualCamAction}
              >
               <Aperture size={14} className="mr-2"/>
               {isVirtualCamActive ? 'Stop Virtual Camera' : 'Start Virtual Camera'}
             </Button>

             <Button 
                variant={isStudioMode ? 'primary' : 'secondary'} 
                size="sm"
                className="justify-start pl-3"
                onClick={onStudioModeAction}
              >
               <SplitSquareHorizontal size={14} className="mr-2"/>
               Studio Mode
             </Button>

             <Button 
                variant={isStudioMode ? 'secondary' : 'secondary'} 
                size="sm"
                className="justify-start pl-3 mt-auto"
              >
               <Settings size={14} className="mr-2"/>
               Settings
             </Button>

             <Button 
                variant="secondary" 
                size="sm"
                className="justify-start pl-3"
              >
               <LogOutIcon /> Exit
             </Button>
           </div>
        </div>

      </div>
    </main>
  );
};

const LogOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)
