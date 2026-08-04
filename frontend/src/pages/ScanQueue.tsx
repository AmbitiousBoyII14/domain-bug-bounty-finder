import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, CheckCircle, XCircle, Clock, RotateCcw, X } from 'lucide-react';
import { useScans, useRetryScan, useCancelScan } from '../hooks/useScans';
import type { Scan } from '../types';

export default function ScanQueue() {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useScans({ status: filter || undefined });
  const retryScan = useRetryScan();
  const cancelScan = useCancelScan();
  const scans: Scan[] = data?.data || [];

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={18} className="text-emerald-400" />;
      case 'failed': return <XCircle size={18} className="text-red-400" />;
      case 'running': return <RefreshCw size={18} className="text-cyber-blue animate-spin" />;
      default: return <Clock size={18} className="text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Scan Queue</h1><p className="text-gray-500 text-sm mt-1">Monitor and manage domain scans</p></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto"><option value="">All Scans</option><option value="queued">Queued</option><option value="running">Running</option><option value="completed">Completed</option><option value="failed">Failed</option></select></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['queued', 'running', 'completed', 'failed'].map((status) => { const count = scans.filter(s => s.status === status).length; const colors: Record<string, string> = { queued: 'text-amber-400', running: 'text-cyber-blue', completed: 'text-emerald-400', failed: 'text-red-400' }; return <div key={status} className="glass p-4 text-center"><p className={`text-2xl font-bold ${colors[status]}`}>{count}</p><p className="text-xs text-gray-500 capitalize">{status}</p></div>; })}</div>
      <div className="space-y-3">{isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />) : scans.length ? scans.map((scan) => (<motion.div key={scan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 card-hover"><div className="flex items-center justify-between"><div className="flex items-center gap-4">{statusIcon(scan.status)}<div><p className="font-semibold text-sm">{scan.target?.domain || 'Unknown'}</p><div className="flex items-center gap-2 mt-1"><span className="badge badge-info text-[10px]">{scan.type.toUpperCase()}</span><span className={`badge ${scan.status === 'completed' ? 'badge-success' : scan.status === 'failed' ? 'badge-danger' : scan.status === 'running' ? 'badge-info' : 'badge-warning'}`}>{scan.status}</span></div>{scan.error && <p className="text-xs text-red-400 mt-1 truncate max-w-md">{scan.error}</p>}</div></div><div className="flex items-center gap-3">{scan.status === 'running' && <div className="w-32"><div className="h-2 bg-cyber-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan rounded-full transition-all duration-500" style={{ width: `${scan.progress}%` }} /></div><p className="text-xs text-gray-500 text-right mt-1">{scan.progress}%</p></div>}{scan.status === 'failed' && <button onClick={() => retryScan.mutate(scan.id)} className="btn-secondary flex items-center gap-1 text-sm py-1.5"><RotateCcw size={14} /> Retry</button>}{(scan.status === 'queued' || scan.status === 'running') && <button onClick={() => cancelScan.mutate(scan.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"><X size={16} /></button>}</div></div></motion.div>)) : <div className="text-center py-12 text-gray-500"><Activity size={48} className="mx-auto mb-4 opacity-30" /><p>No scans found</p></div>}</div>
    </div>
  );
}
