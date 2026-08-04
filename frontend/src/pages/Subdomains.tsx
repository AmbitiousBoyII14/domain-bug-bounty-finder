import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Subdomains() {
  const [targetId, setTargetId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data: targetsRes } = useQuery({ queryKey: ['targets-list'], queryFn: async () => { const res = await api.get('/targets', { params: { limit: 100 } }); return res.data.data; } });
  const { data, isLoading } = useQuery({ queryKey: ['subdomains', targetId, page, search], queryFn: async () => { if (!targetId) return null; const res = await api.get(`/subdomains/${targetId}`, { params: { page, search, limit: 50 } }); return res.data; }, enabled: !!targetId });

  const handleExport = async (format: string) => {
    if (!targetId) return;
    const res = await api.get(`/subdomains/${targetId}/export`, { params: { format }, responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = `subdomains.${format}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Subdomains</h1><p className="text-gray-500 text-sm mt-1">{data?.meta?.total || 0} subdomains discovered</p></div><div className="flex gap-2"><button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2" disabled={!targetId}><Download size={16} /> CSV</button><button onClick={() => handleExport('txt')} className="btn-secondary flex items-center gap-2" disabled={!targetId}><Download size={16} /> TXT</button></div></div>
      <div className="flex gap-4"><select value={targetId} onChange={(e) => { setTargetId(e.target.value); setPage(1); }} className="input-field max-w-xs"><option value="">Select a target...</option>{targetsRes?.map((t: any) => <option key={t.id} value={t.id}>{t.domain}</option>)}</select>{targetId && <div className="relative flex-1 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search subdomains..." className="input-field pl-10" /></div>}</div>
      {!targetId ? <div className="text-center py-12 text-gray-500"><Globe size={48} className="mx-auto mb-4 opacity-30" /><p>Select a target to view its subdomains</p></div> : isLoading ? <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}</div> : <div className="space-y-2">{data?.data?.map((sub: any) => <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-3 card-hover flex items-center justify-between"><div className="flex items-center gap-3">{sub.status === 'verified' ? <CheckCircle size={16} className="text-emerald-400" /> : sub.status === 'invalid' ? <XCircle size={16} className="text-red-400" /> : <AlertCircle size={16} className="text-amber-400" />}<span className="text-sm font-mono font-medium">{sub.name}</span>{sub.ipAddress && <span className="text-xs text-gray-500 font-mono">{sub.ipAddress}</span>}</div><div className="flex items-center gap-2"><span className={`badge text-[10px] ${sub.status === 'verified' ? 'badge-success' : sub.status === 'invalid' ? 'badge-danger' : 'badge-warning'}`}>{sub.status}</span><span className="badge badge-info text-[10px]">{sub.source}</span></div></motion.div>)}{data?.data?.length === 0 && <p className="text-center text-gray-500 py-8">No subdomains found</p>}</div>}
      {data?.meta && data.meta.totalPages > 1 && <div className="flex items-center justify-center gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">Previous</button><span className="text-sm text-gray-500 px-4">Page {page} of {data.meta.totalPages}</span><button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="btn-secondary text-sm">Next</button></div>}
    </div>
  );
}
