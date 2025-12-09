import React from 'react';
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  Bell, 
  Activity,
  Zap,
  Youtube,
  Twitch,
  Facebook
} from 'lucide-react';
import { Account, StreamState } from '../types';
import { Button } from './ui/Button';

interface ProfilePanelProps {
  activeAccount: Account | null;
  accounts: Account[];
  streamState: StreamState;
  onSwitchAccount: (accountId: string) => void;
  onAddAccount: () => void;
  onLogout: () => void;
  onSettings: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ 
  activeAccount, 
  accounts, 
  streamState,
  onSwitchAccount,
  onAddAccount,
  onLogout,
  onSettings
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube size={14} />;
      case 'twitch': return <Twitch size={14} />;
      case 'facebook': return <Facebook size={14} />;
      default: return <Zap size={14} />;
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-zinc-950 border-l border-zinc-800 flex flex-col h-full">
      {/* Profile Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <img 
              src={activeAccount?.avatarUrl || "https://picsum.photos/100"} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full border-2 border-zinc-800 object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${streamState === StreamState.LIVE ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{activeAccount?.username || 'Guest User'}</h3>
            <div className="flex items-center text-xs text-zinc-400 mt-0.5">
              <span className="mr-1">{activeAccount ? getPlatformIcon(activeAccount.platform) : <User size={12} />}</span>
              <span className="capitalize truncate">{activeAccount?.platform || 'Offline'}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           <Button size="sm" variant="secondary" className="w-full text-xs" onClick={onSettings}>
             <Settings size={14} className="mr-2" /> Settings
           </Button>
           <Button size="sm" variant="secondary" className="w-full text-xs" onClick={onLogout}>
             <LogOut size={14} className="mr-2" /> Logout
           </Button>
        </div>
      </div>

      {/* Account Switcher */}
      <div className="p-4 border-b border-zinc-800">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-3 tracking-wider">Linked Accounts</h4>
        <div className="space-y-2">
          {accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => onSwitchAccount(acc.id)}
              className={`w-full flex items-center p-2 rounded-md transition-colors ${
                activeAccount?.id === acc.id 
                ? 'bg-zinc-800 border border-zinc-700' 
                : 'hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <img src={acc.avatarUrl} alt="" className="w-8 h-8 rounded-full mr-3 opacity-80" />
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-medium text-zinc-200 truncate">{acc.username}</div>
                <div className="text-[10px] text-zinc-500 flex items-center capitalize">
                  {acc.platform}
                </div>
              </div>
              {activeAccount?.id === acc.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-2" />
              )}
            </button>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs border border-dashed border-zinc-700 mt-2 text-zinc-500 hover:text-zinc-300"
            onClick={onAddAccount}
          >
            + Link New Account
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notifications</h4>
          <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>
        </div>
        
        <div className="space-y-3">
          <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-start">
              <div className="mt-1 bg-yellow-500/10 p-1.5 rounded text-yellow-500 mr-3">
                <Bell size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">System Update</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">New filters available in audio mixer.</p>
                <p className="text-[10px] text-zinc-600 mt-2">2 min ago</p>
              </div>
            </div>
          </div>
           <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-start">
              <div className="mt-1 bg-blue-500/10 p-1.5 rounded text-blue-500 mr-3">
                <Activity size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">Performance</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">CPU usage normalized after spike.</p>
                <p className="text-[10px] text-zinc-600 mt-2">15 min ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing / Plan */}
      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-300 flex items-center">
            <CreditCard size={12} className="mr-2" />
            Pro Plan
          </span>
          <span className="text-[10px] text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">Active</span>
        </div>
        <p className="text-[10px] text-zinc-500 mb-3">Next billing date: Oct 24, 2024</p>
        <Button variant="outline" size="sm" className="w-full text-xs h-8">Manage Subscription</Button>
      </div>
    </aside>
  );
};