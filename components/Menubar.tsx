
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Settings, 
  Layout, 
  Monitor, 
  Users, 
  Layers, 
  Wrench, 
  HelpCircle,
  ChevronRight,
  LogOut,
  FolderOpen,
  Save,
  Scissors,
  Copy,
  Clipboard,
  Maximize
} from 'lucide-react';

export const Menubar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menus = [
    { 
      label: 'File', 
      items: [
        { label: 'Show Recordings', icon: FolderOpen },
        { label: 'Remux Recordings' },
        { label: 'Settings', icon: Settings, shortcut: 'Ctrl+,' },
        { label: 'Show Settings Folder' },
        { label: 'Show Profile Folder' },
        { separator: true },
        { label: 'Exit', icon: LogOut, shortcut: 'Ctrl+Q' }
      ]
    },
    { 
      label: 'Edit', 
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z' },
        { label: 'Redo', shortcut: 'Ctrl+Y' },
        { separator: true },
        { label: 'Copy', icon: Copy, shortcut: 'Ctrl+C' },
        { label: 'Paste (Reference)', icon: Clipboard, shortcut: 'Ctrl+V' },
        { label: 'Paste (Duplicate)' },
        { separator: true },
        { label: 'Transform' },
        { label: 'Order' },
        { label: 'Lock Preview', icon: Layout }
      ]
    },
    { 
      label: 'View', 
      items: [
        { label: 'Fullscreen Interface', icon: Maximize, shortcut: 'F11' },
        { label: 'Docks' },
        { label: 'Stats' },
        { label: 'Multiview (Windowed)' },
        { label: 'Multiview (Fullscreen)' }
      ]
    },
    { 
      label: 'Profile', 
      items: [
        { label: 'New' },
        { label: 'Duplicate' },
        { label: 'Rename' },
        { label: 'Import' },
        { label: 'Export' },
        { separator: true },
        { label: 'Untitled (Current)' }
      ]
    },
    { 
      label: 'Scene Collection', 
      items: [
        { label: 'New' },
        { label: 'Duplicate' },
        { label: 'Rename' },
        { label: 'Import' },
        { label: 'Export' },
        { separator: true },
        { label: 'Default (Current)' }
      ]
    },
    { 
      label: 'Tools', 
      items: [
        { label: 'Auto-Configuration Wizard', icon: Wrench },
        { label: 'Decklink Output' },
        { label: 'Captions (Experimental)' },
        { label: 'Automatic Scene Switcher' },
        { label: 'Output Timer' },
        { label: 'Scripts' }
      ]
    },
    { 
      label: 'Help', 
      items: [
        { label: 'Help Portal', icon: HelpCircle },
        { label: 'Visit Website' },
        { label: 'Join Discord Server' },
        { separator: true },
        { label: 'Check for Updates' },
        { label: 'About' }
      ]
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-8 bg-zinc-950 border-b border-zinc-800 flex items-center px-2 select-none z-50 relative" ref={menuRef}>
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
            className={`px-3 h-8 flex items-center text-xs transition-colors focus:outline-none ${
              activeMenu === menu.label 
                ? 'bg-indigo-600 text-white' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {menu.label}
          </button>

          {activeMenu === menu.label && (
            <div className="absolute top-full left-0 min-w-[220px] bg-zinc-900 border border-zinc-700 shadow-xl rounded-b-md py-1 z-50">
              {menu.items.map((item, idx) => {
                if (item.separator) {
                  return <div key={idx} className="h-px bg-zinc-800 my-1 mx-2" />;
                }
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    className="w-full text-left px-4 py-1.5 text-xs text-zinc-300 hover:bg-indigo-600 hover:text-white flex items-center justify-between group"
                    onClick={() => setActiveMenu(null)}
                  >
                    <div className="flex items-center">
                      {Icon && <Icon size={14} className="mr-2 text-zinc-500 group-hover:text-white" />}
                      {!Icon && <span className="w-5 mr-0.5"></span>}
                      {item.label}
                    </div>
                    {item.shortcut && <span className="text-zinc-500 group-hover:text-zinc-300 text-[10px] ml-4">{item.shortcut}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
