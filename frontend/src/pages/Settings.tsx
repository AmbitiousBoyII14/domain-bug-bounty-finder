import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Palette } from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/useStore';
import api from '../api/client';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const accentColors = ['cyan', 'emerald', 'purple', 'amber', 'rose', 'blue', 'orange', 'teal'];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme, accentColor, setAccentColor } = useUIStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [notifications, setNotifications] = useState(user?.notifications ?? true);

  const updateSettings = useMutation({
    mutationFn: async (data: any) => { const res = await api.patch('/users/settings', data); return res.data.data; },
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-500 text-sm mt-1">Customize your experience</p></div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Palette size={18} className="text-cyber-blue" /> Appearance</h3>
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Theme</p><p className="text-xs text-gray-500">Dark or light mode</p></div><div className="flex bg-cyber-dark rounded-lg p-1"><button onClick={() => setTheme('dark')} className={`px-3 py-1.5 rounded-md text-sm transition-all ${theme === 'dark' ? 'bg-cyber-blue/20 text-cyber-blue' : 'text-gray-500'}`}>Dark</button><button onClick={() => setTheme('light')} className={`px-3 py-1.5 rounded-md text-sm transition-all ${theme === 'light' ? 'bg-cyber-blue/20 text-cyber-blue' : 'text-gray-500'}`}>Light</button></div></div>
        <div><p className="text-sm font-medium mb-2">Accent Color</p><div className="flex gap-2">{accentColors.map((color) => <button key={color} onClick={() => setAccentColor(color)} className={`w-8 h-8 rounded-lg bg-${color}-500 transition-all ${accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-cyber-card' : ''}`} />)}</div></div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><SettingsIcon size={18} className="text-cyber-blue" /> Profile</h3>
        <div><label className="text-sm text-gray-400">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field mt-1" /></div>
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-gray-500">Scan completion alerts</p></div><button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-all ${notifications ? 'bg-cyber-blue' : 'bg-cyber-border'}`}><div className={`w-5 h-5 rounded-full bg-white transition-all ${notifications ? 'ml-6' : 'ml-0.5'}`} /></button></div>
      </motion.div>
      <button onClick={() => updateSettings.mutate({ displayName, notifications, theme, accentColor })} className="btn-primary" disabled={updateSettings.isPending}>{updateSettings.isPending ? 'Saving...' : 'Save Settings'}</button>
    </div>
  );
}
