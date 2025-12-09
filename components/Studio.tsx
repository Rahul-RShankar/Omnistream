import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Mic, MicOff, Monitor, Plus, Trash2, Maximize, AlertTriangle, Camera, Layers, Video, Image as ImageIcon, Eye, EyeOff, Settings, ChevronUp, ChevronDown, MoreVertical, Zap, Sliders, SplitSquareHorizontal, Aperture, ArrowRightLeft
} from 'lucide-react';
import { Scene, Source, StreamMetrics, StreamState } from '../types';
import { Button } from './ui/Button';

// ... SourceRenderer remains same (simplified here to focus on logic update) ...
const SourceRenderer: React.FC<{ source: Source; index: number; onStreamReady: (id: string, stream: MediaStream) => void; }> = ({ source, index, onStreamReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!source.visible) return;
    const init = async () => {
      try {
        if (source.type === 'webcam') {
           const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
           if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.muted = true; }
           onStreamReady(source.id, stream);
        } else if (source.type === 'screen') {
           const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
           if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.muted = true; }
           onStreamReady(source.id, stream);
        } else if (source.type === 'local_file' && source.config.file) {
           if (videoRef.current) { videoRef.current.src = URL.createObjectURL(source.config.file); videoRef.current.muted = true; }
        } else if (source.type === 'remote_url' && source.config.url) {
           // For youtube, iframe handles itself, no stream ready
        }
      } catch (e) { console.error(e); }
    };
    init();
  }, [source]);

  // Simplified render logic for brevity
  const style: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: index };
  if (!source.visible) return null;
  if (source.type === 'remote_url' && source.config.url) {
     const vidId = source.config.url.match(/v=([^&]+)/)?.[1];
     return <div style={style} className="bg-black"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${vidId}?autoplay=1&mute=1&controls=0`} frameBorder="0" className="pointer-events-none" /></div>;
  }
  return <video ref={videoRef} style={style} autoPlay playsInline muted />;
};

interface StudioProps {
  currentScene: Scene | null;
  scenes: Scene[];
  streamState: StreamState;
  isRecording: boolean;
  isVirtualCamActive: boolean;
  isStudioMode: boolean;
  metrics: StreamMetrics;
  onStreamAction: () => void;
  onStreamDataAvailable: (data: Blob) => void; // New Prop
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

export const Studio: React.FC<StudioProps> = ({ 
  currentScene, scenes, streamState, isRecording, isVirtualCamActive, isStudioMode, metrics,
  onStreamAction, onStreamDataAvailable, onRecordAction, onVirtualCamAction, onStudioModeAction,
  onSceneSelect, onAddScene, onRemoveScene, onMoveScene, onAddSource, onRemoveSource, onMoveSource,
  onEditSource, onToggleMute, onToggleSourceVisibility
}) => {
  const activeStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const streamRecorderRef = useRef<MediaRecorder | null>(null);

  // Streaming Logic (Ingest)
  useEffect(() => {
    if (streamState === StreamState.LIVE) {
      // Look for a stream (Webcam/Screen)
      const streams = Array.from(activeStreamsRef.current.values());
      const mainStream = streams.find(s => s.getVideoTracks().length > 0);
      
      if (mainStream) {
        try {
          // Use low-latency codec settings if possible
          const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=h264') ? 'video/webm;codecs=h264' : 'video/webm';
          const recorder = new MediaRecorder(mainStream, { mimeType, videoBitsPerSecond: 3000000 });
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              onStreamDataAvailable(e.data);
            }
          };
          // Request data every 100ms for realtime streaming
          recorder.start(100);
          streamRecorderRef.current = recorder;
          console.log("Started socket streaming");
        } catch (e) {
          console.error("Failed to start socket stream", e);
        }
      } else {
        console.warn("No active media stream found to broadcast (Relay mode might be active)");
      }
    } else {
      if (streamRecorderRef.current) {
        streamRecorderRef.current.stop();
        streamRecorderRef.current = null;
        console.log("Stopped socket streaming");
      }
    }
  }, [streamState]);

  const handleStreamReady = (id: string, stream: MediaStream) => activeStreamsRef.current.set(id, stream);
  
  // Render
  return (
    <main className="flex-1 flex flex-col bg-zinc-900 overflow-hidden relative">
      <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
           <span className="text-xs font-mono text-zinc-400">{metrics.fps} FPS</span>
           <span className={`text-xs font-mono px-2 py-1 rounded ${streamState === StreamState.LIVE ? 'text-green-400 bg-green-900/20' : 'text-zinc-500'}`}>
             {streamState === StreamState.LIVE ? 'LIVE' : 'OFFLINE'}
           </span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col bg-zinc-900/50 relative">
        <div className="flex-1 flex space-x-4 min-h-0">
           <div className="relative bg-black rounded-lg border border-red-900/50 flex-1 flex flex-col overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
               {currentScene?.sources.map((src, idx) => <SourceRenderer key={src.id} source={src} index={idx} onStreamReady={handleStreamReady} />)}
             </div>
           </div>
        </div>
      </div>

      {/* Control Panel (Docked at bottom right of main area logic in standard UI, explicit here) */}
      <div className="h-64 bg-zinc-950 border-t border-zinc-800 flex divide-x divide-zinc-800 shrink-0">
        <div className="w-56 p-2"><h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Scenes</h4>{/* Scenes List Impl */}
          {scenes.map(s => <div key={s.id} onClick={() => onSceneSelect(s.id)} className={`p-1 cursor-pointer ${currentScene?.id===s.id?'text-indigo-400':'text-zinc-400'}`}>{s.name}</div>)}
          <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={onAddScene}>+ Add Scene</Button>
        </div>
        <div className="w-56 p-2"><h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Sources</h4>{/* Sources List Impl */}
          {currentScene?.sources.map(s => <div key={s.id} className="p-1 text-zinc-300 flex justify-between">{s.name} <Trash2 size={12} onClick={() => onRemoveSource(currentScene.id, s.id)} className="cursor-pointer"/></div>)}
          <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={() => currentScene && onAddSource(currentScene.id)}>+ Add Source</Button>
        </div>
        <div className="flex-1 p-2 border-r border-zinc-800"><h4 className="text-xs font-bold text-zinc-400 uppercase">Mixer</h4></div>
        <div className="w-64 p-4 space-y-2 bg-zinc-900/20">
             <Button variant={streamState === StreamState.LIVE ? 'danger' : 'primary'} size="sm" className="w-full justify-start" onClick={onStreamAction}>
               {streamState === StreamState.LIVE ? 'Stop Streaming' : 'Start Streaming'}
             </Button>
             <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => onRecordAction(!isRecording)}>
               {isRecording ? 'Stop Recording' : 'Start Recording'}
             </Button>
             <Button variant="secondary" size="sm" className="w-full justify-start" onClick={onVirtualCamAction}>Virtual Camera</Button>
             <Button variant="secondary" size="sm" className="w-full justify-start" onClick={onStudioModeAction}>Studio Mode</Button>
             <Button variant="secondary" size="sm" className="w-full justify-start">Settings</Button>
        </div>
      </div>
    </main>
  );
};