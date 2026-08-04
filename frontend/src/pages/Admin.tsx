import { motion } from 'framer-motion';
import { Users, Database, Activity, Shield, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function Admin() {
  const { data: statsRes } = useQuery({ queryKey: ['admin-stats'], queryFn: async () => { const res = await api.get('/admin/stats'); return res.data.data; } });
  const clearCache = useMutation({ mutationFn: async () => { await api.post('/admin/cache/clear'); }, onSuccess: () => toast.success('Cache cleared'), onError: () => toast.error('Failed to clear cache') });

  if (!statsRes) return <div className="space-y-4"><div className="skeleton h-8 w-48" /><div className="skeleton h-48 w-full rounded-xl" /></div>;

  const stats = [
    { label: 'Total Users', value: statsRes.users, icon: Users, color: 'from-cyber-blue to-cyan-500' },
    { label: 'Total Targets', value: statsRes.targets, icon: Shield, color: 'from-purple-500 to-cyber-purple' },
    { label: 'Total Scans', value: statsRes.scans, icon: Activity, color: 'from-emerald-500 to-green-500' },
    { label: 'Subdomains', value: statsRes.subdomains, icon: Database, color: 'from-amber-500 to-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-gray-500 text-sm mt-1">System overview</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(({ label, value, icon: Icon, color }) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 card-hover"><div className="flex items-start justify-between"><div><p className="text-gray-500 text-sm">{label}</p><p className="text-3xl font-bold mt-1">{value}</p></div><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}><Icon size={20} className="text-black" /></div></div></motion.div>)}</div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6"><h3 className="font-semibold mb-4">Cache Management</h3><p className="text-sm text-gray-400 mb-4">Clear Redis cache</p><button onClick={() => clearCache.mutate()} disabled={clearCache.isPending} className="btn-danger flex items-center gap-2"><Trash2 size={16} />{clearCache.isPending ? 'Clearing...' : 'Clear Cache'}</button></motion.div>
    </div>
  );
}
