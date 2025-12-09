import React from 'react';
import { Account } from '../types';
import { Button } from './ui/Button';
import { 
  BarChart2, 
  Globe, 
  Shield, 
  Wifi, 
  Settings as SettingsIcon,
  HardDrive,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Radio
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

interface ViewProps {
  className?: string;
}

const ViewContainer: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <main className="flex-1 flex flex-col bg-zinc-900 overflow-y-auto p-8 animate-in fade-in duration-300">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
      {subtitle && <p className="text-zinc-400 text-sm">{subtitle}</p>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </main>
);

export const DestinationsView: React.FC<ViewProps> = () => {
  const destinations = [
    { id: 1, name: 'YouTube Live (Primary)', url: 'rtmp://a.rtmp.youtube.com/live2', key: '••••••••••••', status: 'Ready', enabled: true },
    { id: 2, name: 'Twitch Ingest', url: 'rtmp://live-sfo.twitch.tv/app', key: '••••••••••••', status: 'Ready', enabled: true },
    { id: 3, name: 'Facebook Live', url: 'rtmps://live-api-s.facebook.com:443/rtmp/', key: '••••••••••••', status: 'Disabled', enabled: false },
  ];

  return (
    <ViewContainer title="Multistream Destinations" subtitle="Manage your RTMP targets and streaming platforms.">
      <div className="grid gap-4 max-w-4xl">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-4">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-3">
               <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                 <Radio size={24} />
               </div>
               <div>
                 <h3 className="font-semibold text-zinc-100">Smart Relay</h3>
                 <p className="text-xs text-zinc-500">Cloud-based transcoding and distribution</p>
               </div>
             </div>
             <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Active</span>
                <Button size="sm">Configure Relay</Button>
             </div>
           </div>
        </div>

        {destinations.map(dest => (
          <div key={dest.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`w-2 h-2 rounded-full ${dest.enabled ? 'bg-green-500' : 'bg-zinc-600'}`} />
              <div>
                <h4 className="text-sm font-medium text-zinc-200">{dest.name}</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{dest.url}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-0.5 rounded ${dest.enabled ? 'bg-zinc-700 text-zinc-300' : 'text-zinc-500'}`}>
                {dest.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <Button size="sm" variant={dest.enabled ? "secondary" : "outline"}>
                {dest.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="mt-4 border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200">
          + Add Custom RTMP Destination
        </Button>
      </div>
    </ViewContainer>
  );
};

export const AccountsView: React.FC<{ accounts: Account[]; onAddAccount: () => void; onRemoveAccount: (id: string) => void }> = ({ accounts, onAddAccount, onRemoveAccount }) => {
  return (
    <ViewContainer title="Connected Accounts" subtitle="Manage authentication for sources and destinations.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              {account.platform === 'youtube' && <Globe size={64} className="text-zinc-800" />}
              {account.platform === 'twitch' && <Zap size={64} className="text-zinc-800" />}
              {account.platform === 'facebook' && <div className="text-blue-500"><Zap size={64} /></div>}
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center mb-4">
                <img src={account.avatarUrl || "https://picsum.photos/100"} alt="" className="w-12 h-12 rounded-full border-2 border-zinc-800" />
                <div className="ml-3 overflow-hidden">
                  <h3 className="font-bold text-white truncate">{account.username}</h3>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{account.platform}</span>
                </div>
              </div>
              
              <div className="mt-auto space-y-2">
                <div className="flex items-center text-xs text-green-400">
                  <CheckCircle size={12} className="mr-1.5" />
                  Token Valid
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="secondary" className="w-full">Refresh</Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-red-400 hover:text-red-300 border-red-900/30 hover:bg-red-900/10"
                    onClick={() => onRemoveAccount(account.id)}
                  >
                    Unlink
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={onAddAccount}
          className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <Users size={24} />
          </div>
          <span className="font-medium">Connect New Account</span>
        </button>
      </div>
    </ViewContainer>
  );
};

export const AnalyticsView: React.FC = () => {
  const data = [
    { name: '00:00', viewers: 120 },
    { name: '00:10', viewers: 132 },
    { name: '00:20', viewers: 185 },
    { name: '00:30', viewers: 240 },
    { name: '00:40', viewers: 210 },
    { name: '00:50', viewers: 280 },
    { name: '01:00', viewers: 310 },
  ];

  return (
    <ViewContainer title="Stream Analytics" subtitle="Performance metrics and audience engagement.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Avg Viewers', value: '245', icon: Users, color: 'text-indigo-400' },
          { label: 'New Followers', value: '+32', icon: CheckCircle, color: 'text-green-400' },
          { label: 'Stream Duration', value: '1h 42m', icon: Clock, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-4 flex items-center">
            <div className="p-3 rounded-lg bg-zinc-900 mr-4">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase font-semibold">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800/20 border border-zinc-800 rounded-xl p-6 h-80">
        <h3 className="text-sm font-semibold text-zinc-400 mb-6">Live Viewership History</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
              itemStyle={{ color: '#e4e4e7' }}
            />
            <Area type="monotone" dataKey="viewers" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorViewers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ViewContainer>
  );
};

export const SettingsView: React.FC = () => {
  return (
    <ViewContainer title="Settings" subtitle="Configure application preferences and streaming output.">
      <div className="max-w-3xl space-y-8">
        
        {/* Output Section */}
        <section>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Wifi size={20} className="mr-2 text-indigo-500" /> Stream Output
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
            <div className="p-4 grid grid-cols-3 gap-4 items-center hover:bg-zinc-800/50 transition-colors">
              <label className="text-sm text-zinc-300 font-medium">Video Bitrate</label>
              <div className="col-span-2 flex items-center space-x-2">
                <input type="range" className="flex-1 accent-indigo-500" />
                <span className="text-xs font-mono text-zinc-500 w-16 text-right">6000 Kbps</span>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 items-center hover:bg-zinc-800/50 transition-colors">
              <label className="text-sm text-zinc-300 font-medium">Encoder Preset</label>
              <div className="col-span-2">
                 <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                   <option>Quality (Slow)</option>
                   <option>Balanced</option>
                   <option>Performance (Fast)</option>
                 </select>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <HardDrive size={20} className="mr-2 text-indigo-500" /> Video & Recording
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
             <div className="p-4 grid grid-cols-3 gap-4 items-center hover:bg-zinc-800/50 transition-colors">
              <label className="text-sm text-zinc-300 font-medium">Base Resolution</label>
              <div className="col-span-2">
                 <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                   <option>1920x1080</option>
                   <option>1280x720</option>
                 </select>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 items-center hover:bg-zinc-800/50 transition-colors">
              <label className="text-sm text-zinc-300 font-medium">FPS</label>
              <div className="col-span-2">
                 <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                   <option>60 FPS</option>
                   <option>30 FPS</option>
                 </select>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 items-center hover:bg-zinc-800/50 transition-colors">
               <label className="text-sm text-zinc-300 font-medium">Recording Path</label>
               <div className="col-span-2 flex space-x-2">
                 <input type="text" readOnly value="C:/Users/Streamer/Videos" className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-400" />
                 <Button size="sm" variant="secondary">Browse</Button>
               </div>
            </div>
          </div>
        </section>

      </div>
    </ViewContainer>
  );
};

export const PlaceholderView: React.FC<{ title: string }> = ({ title }) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-zinc-900 text-center p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-zinc-700">
        <SettingsIcon size={40} className="text-zinc-600" />
      </div>
      <h2 className="text-2xl font-bold text-white capitalize mb-2">{title}</h2>
      <p className="text-zinc-500 max-w-md">
        This module is currently under development. Check back later for updates or check the roadmap.
      </p>
      <Button className="mt-8" variant="secondary">Return to Dashboard</Button>
    </main>
  );
};