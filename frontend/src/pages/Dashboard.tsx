import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Activity, Shield, Server, Cpu, ArrowRight, Clock, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react';
import { useDashboardStats } from '../hooks/useTargets';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statCards = [
  { key: 'targetsScanned', label: 'Domains Scanned', icon: Globe, color: 'from-cyber-blue to-cyan-500' },
  { key: 'subdomainsFound', label: 'Subdomains', icon: Server, color: 'from-purple-500 to-cyber-purple' },
  { key: 'technologiesDetected', label: 'Technologies', icon: Cpu, color: 'from-emerald-500 to-green-500' },
  { key: 'certificates', label: 'Certificates', icon: Shield, color: 'from-amber-500 to-yellow-500' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const scanStatusData = stats ? [
    { name: 'Completed', value: stats.scanStatusBreakdown.completed || 0, color: '#10b981' },
    { name: 'Running', value: stats.scanStatusBreakdown.running || 0, color: '#00d4ff' },
    { name: 'Queued', value: stats.scanStatusBreakdown.queued || 0, color: '#7c3aed' },
    { name: 'Failed', value: stats.scanStatusBreakdown.failed || 0, color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  const mockActivityData = [{ hour: '00:00', scans: 1 }, { hour: '04:00', scans: 3 }, { hour: '08:00', scans: 8 }, { hour: '12:00', scans: 12 }, { hour: '16:00', scans: 7 }, { hour: '20:00', scans: 5 }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-gray-500 text-sm mt-1">Security research overview</p></div><Link to="/scans" className="btn-primary flex items-center gap-2"><Zap size={16} /> New Scan</Link></div>
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <motion.div key={key} variants={item} className="glass p-5 card-hover relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5"><Icon size={96} /></div>
            <div className="flex items-start justify-between"><div><p className="text-gray-500 text-sm">{label}</p>{isLoading ? <div className="skeleton h-8 w-16 mt-2" /> : <p className="text-3xl font-bold mt-1">{(stats as any)?.[key]?.toLocaleString() || 0}</p>}</div><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}><Icon size={20} className="text-black" /></div></div>
          </motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} className="text-cyber-blue" /> Scan Status</h3>
          {scanStatusData.length > 0 ? <><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={scanStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{scanStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ background: '#161630', border: '1px solid #1e1e3a', borderRadius: '8px', color: '#e5e7eb' }} /></PieChart></ResponsiveContainer><div className="flex justify-center gap-4 mt-4">{scanStatusData.map((d) => <div key={d.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-gray-400">{d.name} ({d.value})</span></div>)}</div></> : <div className="h-[250px] flex items-center justify-center text-gray-500">No scan data yet</div>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} className="text-cyber-blue" /> Scan Activity</h3>
          <ResponsiveContainer width="100%" height={250}><LineChart data={mockActivityData}><CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" /><XAxis dataKey="hour" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} /><Tooltip contentStyle={{ background: '#161630', border: '1px solid #1e1e3a', borderRadius: '8px', color: '#e5e7eb' }} /><Line type="monotone" dataKey="scans" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} /></LineChart></ResponsiveContainer>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Clock size={18} className="text-cyber-blue" /> Recent Scans</h3><Link to="/scans" className="text-xs text-cyber-blue hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link></div>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 w-full" />) : stats?.recentScans?.length ? stats.recentScans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl bg-cyber-dark/30 border border-cyber-border/20">
                <div className="flex items-center gap-3">{scan.status === 'completed' ? <CheckCircle size={18} className="text-emerald-400" /> : scan.status === 'failed' ? <XCircle size={18} className="text-red-400" /> : scan.status === 'running' ? <RefreshCw size={18} className="text-cyber-blue animate-spin" /> : <Clock size={18} className="text-amber-400" />}<div><p className="text-sm font-medium">{scan.target?.domain || 'Unknown'}</p><p className="text-xs text-gray-500">{scan.type.toUpperCase()}</p></div></div>
                <span className={`badge ${scan.status === 'completed' ? 'badge-success' : scan.status === 'failed' ? 'badge-danger' : scan.status === 'running' ? 'badge-info' : 'badge-warning'}`}>{scan.status}{scan.status === 'running' && ` ${scan.progress}%`}</span>
              </div>
            )) : <p className="text-center text-gray-500 py-8">No scans yet</p>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Globe size={18} className="text-cyber-blue" /> Recent Targets</h3><Link to="/targets" className="text-xs text-cyber-blue hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link></div>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 w-full" />) : stats?.recentTargets?.length ? stats.recentTargets.map((target) => (
              <Link key={target.id} to={`/targets/${target.id}`} className="flex items-center justify-between p-3 rounded-xl bg-cyber-dark/30 border border-cyber-border/20 hover:border-cyber-blue/30 transition-all">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-cyber-blue/10 flex items-center justify-center"><Globe size={14} className="text-cyber-blue" /></div><div><p className="text-sm font-medium">{target.domain}</p><p className="text-xs text-gray-500">{new Date(target.createdAt).toLocaleDateString()}</p></div></div>
                <span className={`badge ${target.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{target.status}</span>
              </Link>
            )) : <p className="text-center text-gray-500 py-8">No targets yet</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
