import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Account } from '../types';
import { CheckCircle, Circle, Radio, Globe, Zap, Facebook, Youtube } from 'lucide-react';

interface StreamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onConfirm: (selectedAccountIds: string[]) => void;
}

export const StreamConfigModal: React.FC<StreamConfigModalProps> = ({ isOpen, onClose, accounts, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const destinationAccounts = accounts.filter(acc => acc.isDestination);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getIcon = (platform: string) => {
    switch(platform) {
      case 'youtube': return <Youtube size={18} />;
      case 'twitch': return <TwitchIcon />;
      case 'facebook': return <Facebook size={18} />;
      default: return <Globe size={18} />;
    }
  };

  const handleGoLive = () => {
    onConfirm(Array.from(selectedIds));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Streaming">
      <div className="space-y-4">
        <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">
           <div className="flex items-start">
             <Radio className="text-indigo-500 mt-1 mr-3 shrink-0" size={20} />
             <div>
               <h4 className="text-sm font-bold text-indigo-400">Multistream Destinations</h4>
               <p className="text-xs text-indigo-300/70 mt-1">
                 Select the platforms you want to broadcast to simultaneously. 
                 The backend will handle transcoding and relaying.
               </p>
             </div>
           </div>
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {destinationAccounts.length === 0 && (
            <p className="text-center text-zinc-500 py-4 text-sm">No destination accounts linked.</p>
          )}
          
          {destinationAccounts.map(acc => {
            const isSelected = selectedIds.has(acc.id);
            return (
              <div 
                key={acc.id}
                onClick={() => toggleSelection(acc.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-zinc-800 border-indigo-500' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                    {getIcon(acc.platform)}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-white">{acc.username}</h5>
                    <span className="text-xs text-zinc-500 capitalize">{acc.platform}</span>
                  </div>
                </div>
                <div className={`text-indigo-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  <CheckCircle size={20} className="fill-current" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleGoLive} 
            disabled={selectedIds.size === 0}
            variant="danger"
            className="w-32"
          >
            Go Live
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zM11 11V7M16 11V7"></path>
  </svg>
);