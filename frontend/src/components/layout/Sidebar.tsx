import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Crosshair, Activity, Globe, Shield, Settings, Users, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useUIStore } from '../../store/useStore';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/targets', icon: Crosshair, label: 'Targets' },
  { to: '/scans', icon: Activity, label: 'Scan Queue' },
  { to: '/subdomains', icon: Globe, label: 'Subdomains' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/admin', icon: Users, label: 'Admin' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  return (
    <motion.aside animate={{ width: sidebarOpen ? 260 : 72 }} className="fixed left-0 top-0 h-screen glass border-r border-cyber-border/50 z-40 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-cyber-border/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-cyan flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-black" />
        </div>
        {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-sm glow-text">DomainFinder</motion.span>}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200', isActive ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' : 'text-gray-400 hover:text-gray-200 hover:bg-cyber-border/30')}>
            <item.icon size={20} />
            {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium">{item.label}</motion.span>}
          </NavLink>
        ))}
      </nav>
      <button onClick={toggleSidebar} className="flex items-center justify-center h-12 border-t border-cyber-border/30 text-gray-500 hover:text-gray-300 transition-colors">
        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </motion.aside>
  );
}
