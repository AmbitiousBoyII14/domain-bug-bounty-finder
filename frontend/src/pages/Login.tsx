import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('demo@domainfinder.io');
  const [password, setPassword] = useState('demo123!');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); login.mutate({ email, password }); };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-blue to-cyber-cyan flex items-center justify-center mb-4 animate-glow">
            <Shield size={32} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold glow-text">Domain Bug Bounty Finder</h1>
          <p className="text-gray-500 text-sm mt-1">Security Research Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
          <h2 className="text-lg font-semibold text-center">Sign In</h2>
          <div className="space-y-2"><label className="text-sm text-gray-400 flex items-center gap-2"><Mail size={14} /> Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required /></div>
          <div className="space-y-2"><label className="text-sm text-gray-400 flex items-center gap-2"><Lock size={14} /> Password</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <button type="submit" disabled={login.isPending} className="btn-primary w-full py-3 disabled:opacity-50">{login.isPending ? 'Signing in...' : 'Sign In'}</button>
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cyber-border/50" /></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-cyber-card text-gray-500">or continue with</span></div></div>
          <div className="grid grid-cols-2 gap-3"><button type="button" className="btn-secondary flex items-center justify-center gap-2 py-2.5"><Chrome size={18} /> Google</button><button type="button" className="btn-secondary flex items-center justify-center gap-2 py-2.5"><Github size={18} /> GitHub</button></div>
          <p className="text-center text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-cyber-blue hover:underline">Create one</Link></p>
          <div className="bg-cyber-dark/50 rounded-lg p-3 border border-cyber-border/30"><p className="text-xs text-gray-500 text-center">Demo: demo@domainfinder.io / demo123!</p></div>
        </form>
      </motion.div>
    </div>
  );
}
