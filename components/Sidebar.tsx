import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  MonitorPlay, 
  Sliders, 
  Radio, 
  Users, 
  CalendarClock, 
  BarChart2, 
  Settings, 
  Puzzle,
  Box
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scenes', label: 'Scenes & Collections', icon: Layers },
    { id: 'sources', label: 'Sources', icon: Box },
    { id: 'mixer', label: 'Audio Mixer', icon: Sliders },
    { id: 'multistream', label: 'Destinations', icon: Radio },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'schedule', label: 'Scheduler', icon: CalendarClock },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'plugins', label: 'Plugins', icon: Puzzle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <MonitorPlay className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">StreamForge</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Icon 
                size={18} 
                className={`mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} 
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Storage</span>
            <span className="text-xs text-zinc-500">45%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-1">
            <div className="bg-zinc-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <span className="text-[10px] text-zinc-500">230GB of 500GB used</span>
        </div>
      </div>
    </aside>
  );
};