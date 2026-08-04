import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Shield, Server, Cpu, Activity, Zap, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useTarget } from '../hooks/useTargets';
import { useStartScan } from '../hooks/useScans';
import api from '../api/client';
import { useQuery } from '@tanstack/react-query';

export default function TargetDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: target, isLoading } = useTarget(id!);
  const startScan = useStartScan();
  const { data: dnsData } = useQuery({ queryKey: ['dns', id], queryFn: async () => { const res = await api.get(`/dns/${id}`); return res.data.data; }, enabled: !!id });
  const { data: certData } = useQuery({ queryKey: ['cert', id], queryFn: async () => { const res = await api.get(`/certificates/${id}`); return res.data.data; }, enabled: !!id });
  const { data: techData } = useQuery({ queryKey: ['tech', id], queryFn: async () => { const res = await api.get(`/technologies/${id}`); return res.data.data; }, enabled: !!id });

  if (isLoading) return <div className="space-y-4"><div className="skeleton h-8 w-48" /><div className="skeleton h-48 w-full rounded-xl" /></div>;
  if (!target) return <div className="text-center py-12 text-gray-500">Target not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-4"><Link to="/targets" className="p-2 rounded-lg hover:bg-cyber-border/30 text-gray-400 hover:text-gray-200 transition-all"><ArrowLeft size={20} /></Link><div><h1 className="text-2xl font-bold flex items-center gap-3">{target.domain}<a href={`https://${target.domain}`} target="_blank" rel="noopener noreferrer" className="text-cyber-blue"><ExternalLink size={18} /></a></h1><div className="flex items-center gap-2 mt-1"><span className={`badge ${target.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{target.status}</span>{target.tags?.map((tag: string) => <span key={tag} className="badge badge-info">{tag}</span>)}</div></div></div><button onClick={() => startScan.mutate({ targetId: target.id, type: 'full' })} disabled={startScan.isPending} className="btn-primary flex items-center gap-2"><Zap size={16} /> {startScan.isPending ? 'Starting...' : 'Start Scan'}</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Server size={18} className="text-purple-400" /> DNS Records</h3>{dnsData?.records?.length ? <div className="space-y-2 max-h-80 overflow-y-auto">{Object.entries(dnsData.byType as Record<string, any[]>).map(([type, records]) => <div key={type} className="p-3 rounded-lg bg-cyber-dark/30 border border-cyber-border/20"><span className="badge badge-info mb-2">{type}</span>{records.slice(0, 3).map((r, i) => <p key={i} className="text-xs text-gray-400 font-mono mt-1 truncate">{r.value}</p>)}{records.length > 3 && <p className="text-xs text-gray-600 mt-1">+{records.length - 3} more</p>}</div>)}</div> : <p className="text-gray-500 text-center py-8">No DNS data</p>}</motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-emerald-400" /> SSL/TLS Certificate</h3>{certData ? <div className="space-y-3"><div className="flex items-center gap-2">{certData.isExpired ? <AlertTriangle size={16} className="text-red-400" /> : <CheckCircle size={16} className="text-emerald-400" />}<span className={`text-sm ${certData.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>{certData.isExpired ? 'Expired' : `Valid · ${certData.daysUntilExpiry} days remaining`}</span></div><div><p className="text-xs text-gray-500">Issuer</p><p className="text-sm">{certData.issuer || 'N/A'}</p></div><div><p className="text-xs text-gray-500">TLS Version</p><p className="text-sm">{certData.tlsVersion || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Cipher</p><p className="text-sm font-mono">{certData.cipher || 'N/A'}</p></div></div> : <p className="text-gray-500 text-center py-8">No certificate data</p>}</motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Cpu size={18} className="text-amber-400" /> Technologies</h3>{techData?.techs?.length ? <div className="flex flex-wrap gap-2">{techData.techs.map((tech: any) => <div key={tech.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber-dark/30 border border-cyber-border/20"><span className="text-sm font-medium">{tech.name}</span>{tech.version && <span className="text-xs text-gray-500">{tech.version}</span>}<span className="badge text-[10px] bg-cyber-blue/10 text-cyber-blue">{tech.category}</span></div>)}</div> : <p className="text-gray-500 text-center py-8">No technologies detected</p>}</motion.div>
    </div>
  );
}
