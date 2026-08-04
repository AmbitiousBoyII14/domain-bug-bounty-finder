import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store/useStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-cyber-border/30 glass flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search domains, targets... (Ctrl+K)" className="w-full pl-10 pr-4 py-2 bg-cyber-dark/50 border border-cyber-border/50 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyber-blue/30 transition-all" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-cyber-border/50 rounded text-gray-500">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl hover:bg-cyber-border/30 text-gray-400 hover:text-gray-200 transition-all">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 rounded-xl hover:bg-cyber-border/30 text-gray-400 hover:text-gray-200 transition-all relative">
          <Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-cyber-blue rounded-full" />
        </button>
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-cyber-border/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 flex items-center justify-center"><User size={16} className="text-cyber-blue" /></div>
            <span className="text-sm font-medium text-gray-300 hidden sm:block">{user?.displayName || 'User'}</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 glass border border-cyber-border/50 rounded-xl overflow-hidden z-20">
                <div className="p-3 border-b border-cyber-border/30"><p className="text-sm font-medium">{user?.displayName}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut size={14} /> Sign Out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
