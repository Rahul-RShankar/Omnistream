
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Source } from '../types';
import { Settings, Clock, Keyboard, Mic, X } from 'lucide-react';

interface SourcePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: Source | null;
  onUpdate: (updatedSource: Source) => void;
}

export const SourcePropertiesModal: React.FC<SourcePropertiesModalProps> = ({ isOpen, onClose, source, onUpdate }) => {
  const [localSource, setLocalSource] = useState<Source | null>(null);

  useEffect(() => {
    if (source) {
      setLocalSource(JSON.parse(JSON.stringify(source)));
    }
  }, [source]);

  if (!localSource) return null;

  const handleSave = () => {
    if (localSource) {
      onUpdate(localSource);
      onClose();
    }
  };

  const updateFilter = (key: keyof typeof localSource.filters, value: any) => {
    setLocalSource(prev => {
      if (!prev) return null;
      return {
        ...prev,
        filters: {
          ...(prev.filters || { noiseSuppression: false, echoCancellation: false, gain: 0, compressor: false }),
          [key]: value
        }
      };
    });
  };

  const updateNoiseGate = (field: 'enabled' | 'threshold' | 'release', value: any) => {
    setLocalSource(prev => {
      if (!prev) return null;
      const currentGate = prev.filters?.noiseGate || { enabled: false, threshold: -40, release: 200 };
      return {
        ...prev,
        filters: {
          ...(prev.filters || { noiseSuppression: false, echoCancellation: false, gain: 0, compressor: false }),
          noiseGate: {
            ...currentGate,
            [field]: value
          }
        }
      };
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Properties for '${localSource.name}'`}>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        
        {/* General */}
        <section>
          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center">
            <Settings size={12} className="mr-2"/> General
          </h4>
          <div className="space-y-3">
             <div>
               <label className="block text-sm font-medium text-zinc-300 mb-1">Source Name</label>
               <input 
                 type="text" 
                 value={localSource.name}
                 onChange={(e) => setLocalSource({...localSource, name: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
               />
             </div>
          </div>
        </section>

        {/* Sync & Hotkeys */}
        <section>
          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center">
            <Clock size={12} className="mr-2"/> Sync & Control
          </h4>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-zinc-300 mb-1">Sync Offset (ms)</label>
               <input 
                 type="number" 
                 value={localSource.syncOffset || 0}
                 onChange={(e) => setLocalSource({...localSource, syncOffset: parseInt(e.target.value)})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-300 mb-1">Hotkey</label>
               <div className="relative group">
                 <input 
                   type="text" 
                   value={localSource.hotkey || ''}
                   readOnly
                   placeholder="Click to set key..."
                   onKeyDown={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     setLocalSource({...localSource, hotkey: e.code});
                   }}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white cursor-pointer hover:border-indigo-500 transition-colors focus:ring-1 focus:ring-indigo-500 outline-none"
                 />
                 <Keyboard size={14} className="absolute right-3 top-2.5 text-zinc-500"/>
                 {localSource.hotkey && (
                   <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        setLocalSource({...localSource, hotkey: undefined});
                     }}
                     className="absolute right-8 top-2.5 text-zinc-500 hover:text-white"
                   >
                     <X size={14} />
                   </button>
                 )}
               </div>
               <p className="text-[10px] text-zinc-500 mt-1">Press any key to assign. Click 'X' to clear.</p>
             </div>
          </div>
        </section>

        {/* Audio Filters */}
        <section>
           <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center">
            <Mic size={12} className="mr-2"/> Audio Filters
          </h4>
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 space-y-4">
             
             {/* Simple Filters */}
             <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                  <label className="text-xs font-medium text-zinc-300">Noise Suppression</label>
                  <input 
                    type="checkbox" 
                    checked={localSource.filters?.noiseSuppression || false}
                    onChange={(e) => updateFilter('noiseSuppression', e.target.checked)}
                    className="accent-indigo-500 h-4 w-4"
                  />
               </div>
               <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                  <label className="text-xs font-medium text-zinc-300">Echo Cancellation</label>
                  <input 
                    type="checkbox" 
                    checked={localSource.filters?.echoCancellation || false}
                    onChange={(e) => updateFilter('echoCancellation', e.target.checked)}
                    className="accent-indigo-500 h-4 w-4"
                  />
               </div>
               <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                  <label className="text-xs font-medium text-zinc-300">Compressor</label>
                  <input 
                    type="checkbox" 
                    checked={localSource.filters?.compressor || false}
                    onChange={(e) => updateFilter('compressor', e.target.checked)}
                    className="accent-indigo-500 h-4 w-4"
                  />
               </div>
             </div>

             {/* Noise Gate */}
             <div className="border-t border-zinc-800 pt-4">
               <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-200">Noise Gate</label>
                  <input 
                    type="checkbox" 
                    checked={localSource.filters?.noiseGate?.enabled || false}
                    onChange={(e) => updateNoiseGate('enabled', e.target.checked)}
                    className="accent-indigo-500 h-4 w-4"
                  />
               </div>
               {localSource.filters?.noiseGate?.enabled && (
                 <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-indigo-500/30 ml-1">
                   <div>
                     <div className="flex justify-between mb-1">
                       <label className="text-xs text-zinc-400">Threshold</label>
                       <span className="text-[10px] text-zinc-500">{localSource.filters?.noiseGate?.threshold ?? -40} dB</span>
                     </div>
                     <input 
                       type="range" min="-60" max="0" step="1"
                       value={localSource.filters?.noiseGate?.threshold ?? -40}
                       onChange={(e) => updateNoiseGate('threshold', parseInt(e.target.value))}
                       className="w-full accent-indigo-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                   <div>
                     <div className="flex justify-between mb-1">
                       <label className="text-xs text-zinc-400">Release Time</label>
                       <span className="text-[10px] text-zinc-500">{localSource.filters?.noiseGate?.release ?? 200} ms</span>
                     </div>
                     <input 
                       type="range" min="0" max="1000" step="10"
                       value={localSource.filters?.noiseGate?.release ?? 200}
                       onChange={(e) => updateNoiseGate('release', parseInt(e.target.value))}
                       className="w-full accent-indigo-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
               )}
             </div>

             {/* Gain */}
             <div className="border-t border-zinc-800 pt-4">
                <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-zinc-200">Output Gain</label>
                   <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded">{localSource.filters?.gain || 0} dB</span>
                </div>
                <input 
                  type="range" 
                  min="-20" max="20" step="1"
                  value={localSource.filters?.gain || 0}
                  onChange={(e) => updateFilter('gain', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>-20dB</span>
                  <span>0dB</span>
                  <span>+20dB</span>
                </div>
             </div>
          </div>
        </section>

      </div>
      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-zinc-800">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
};
