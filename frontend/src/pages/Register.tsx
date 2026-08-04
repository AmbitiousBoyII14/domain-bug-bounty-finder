import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../hooks/useAuth';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-blue to-cyber-cyan flex items-center justify-center mb-4 animate-glow"><Shield size={32} className="text-black" /></div>
          <h1 className="text-2xl font-bold glow-text">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the platform</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); register.mutate({ email, password, displayName }); }} className="glass p-8 space-y-5">
          <h2 className="text-lg font-semibold text-center">Sign Up</h2>
          <div className="space-y-2"><label className="text-sm text-gray-400 flex items-center gap-2"><User size={14} /> Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" placeholder="John Doe" /></div>
          <div className="space-y-2"><label className="text-sm text-gray-400 flex items-center gap-2"><Mail size={14} /> Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required /></div>
          <div className="space-y-2"><label className="text-sm text-gray-400 flex items-center gap-2"><Lock size={14} /> Password</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="Min. 8 characters" required minLength={8} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <button type="submit" disabled={register.isPending} className="btn-primary w-full py-3 disabled:opacity-50">{register.isPending ? 'Creating account...' : 'Create Account'}</button>
          <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-cyber-blue hover:underline">Sign in</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
