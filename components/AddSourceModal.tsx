import React, { useState, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Video, Globe, Monitor, Image as ImageIcon, Youtube, Twitch, Layers, Mic } from 'lucide-react';
import { SourceType } from '../types';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sourceData: any) => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<SourceType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourceOptions = [
    { type: 'local_file', label: 'Local Video File', icon: Video, desc: 'Play a video (mp4, webm, mov) from your computer' },
    { type: 'remote_url', label: 'Remote Stream URL', icon: Globe, desc: 'HLS, DASH, or direct MP4 link' },
    { type: 'youtube', label: 'YouTube / Twitch', icon: Youtube, desc: 'Embed a stream from a major platform' },
    { type: 'webcam', label: 'Video Capture Device', icon: Monitor, desc: 'Webcam, Capture Card, or Virtual Camera' },
    { type: 'screen', label: 'Screen / Window Capture', icon: Layers, desc: 'Share your entire screen or a specific window' },
    { type: 'image', label: 'Image / GIF', icon: ImageIcon, desc: 'Static image or animated GIF' },
    { type: 'audio_source', label: 'Audio Input Capture', icon: Mic, desc: 'Microphone or auxiliary audio' },
  ];

  const handleTypeSelect = (type: string) => {
    // Map generic types to specific SourceTypes used in the app
    let appType = type;
    if (type === 'youtube') appType = 'remote_url';
    
    setSelectedType(appType as SourceType);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
    setInputValue('');
    setSelectedFile(null);
    setIsAuthLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setInputValue(e.target.files[0].name);
    }
  };

  const handleAdd = () => {
    const isYoutube = inputValue.includes('youtube.com') || inputValue.includes('youtu.be');
    const isTwitch = inputValue.includes('twitch.tv');

    // Simulate auth check for platforms
    if (selectedType === 'remote_url' && (isYoutube || isTwitch)) {
       setIsAuthLoading(true);
       setTimeout(() => {
         setIsAuthLoading(false);
         onAdd({
           name: isYoutube ? 'YouTube Source' : 'Twitch Source',
           type: 'remote_url',
           config: { url: inputValue },
           isAuthenticated: true,
           provider: isYoutube ? 'youtube' : 'twitch'
         });
         handleClose();
       }, 1000);
       return;
    }

    onAdd({
      name: selectedType === 'webcam' ? 'Webcam Device' : 
            selectedType === 'screen' ? 'Screen Capture' : 
            selectedType === 'local_file' ? (selectedFile?.name || 'Local Video') :
            inputValue || 'New Source',
      type: selectedType,
      config: { 
        url: inputValue,
        file: selectedFile || undefined
      },
      isAuthenticated: true
    });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => handleBack(), 300);
  };

  const renderStep1 = () => (
    <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-2">
      {sourceOptions.map((opt) => (
        <button
          key={opt.type}
          onClick={() => handleTypeSelect(opt.type)}
          className="flex items-center p-3 rounded-lg border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-all text-left group"
        >
          <div className="p-2 bg-zinc-800 rounded-md group-hover:bg-zinc-700 mr-4 text-indigo-400">
            <opt.icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-zinc-200">{opt.label}</h4>
            <p className="text-xs text-zinc-500">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );

  const renderStep2 = () => {
    if (isAuthLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-zinc-300 font-medium">Authenticating Source...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {selectedType === 'local_file' || selectedType === 'image' ? (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Select File</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept={selectedType === 'image' ? "image/*" : "video/*"}
                className="hidden" 
                onChange={handleFileChange}
              />
              <Video className="text-zinc-500 mb-2" size={32} />
              <p className="text-sm text-zinc-300 font-medium">{selectedFile ? selectedFile.name : "Click to browse"}</p>
              <p className="text-xs text-zinc-500 mt-1">{selectedType === 'image' ? 'Supports PNG, JPG, GIF' : 'Supports MP4, MOV, WEBM'}</p>
            </div>
          </div>
        ) : selectedType === 'webcam' || selectedType === 'screen' ? (
           <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
             <div className="flex items-center text-zinc-300 mb-2">
               <Monitor className="mr-2" size={18} />
               <span className="font-medium">Device Selection</span>
             </div>
             <p className="text-xs text-zinc-500 mb-4">
               {selectedType === 'webcam' 
                 ? "We will automatically select your default camera. You can change this in the source settings later." 
                 : "You will be prompted to select a screen or window after clicking 'Add Source'."}
             </p>
           </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Source URL
            </label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="ghost" onClick={handleBack}>Back</Button>
          <Button onClick={handleAdd} disabled={
            (selectedType === 'local_file' && !selectedFile) ||
            ((selectedType === 'remote_url') && !inputValue)
          }>Add Source</Button>
        </div>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={step === 1 ? "Select Source Type" : "Configure Source"}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};