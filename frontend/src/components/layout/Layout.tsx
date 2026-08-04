import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../store/useStore';

export default function Layout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  return (
    <div className="min-h-screen bg-cyber-black">
      <Sidebar />
      <div style={{ marginLeft: sidebarOpen ? 260 : 72 }} className="transition-all duration-300">
        <Header />
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
