import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginView() {
  const { login, settings } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Alis Valves Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 p-2 flex items-center justify-center shadow-inner mb-4">
            <img
              src={settings?.logo_url || '/uploads/default_logo.svg'}
              alt="Alis Valves Logo"
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/uploads/default_logo.svg'; }}
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            {settings?.company_name || 'ALIS VALVES'}
          </h1>
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mt-1">
            ONLINE ERP SYSTEM
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Secure Role-Based Access for Employee Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alisvalves.com"
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-3">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Quick Login Role Selection:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@alisvalves.com', 'admin123')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-white">Admin / Owner</div>
              <div className="text-[10px] text-blue-400">admin@alisvalves.com</div>
            </button>
            <button
              onClick={() => handleQuickLogin('sales@alisvalves.com', 'password123')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-white">Sales Executive</div>
              <div className="text-[10px] text-slate-400">sales@alisvalves.com</div>
            </button>
            <button
              onClick={() => handleQuickLogin('qc@alisvalves.com', 'password123')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-white">QC Inspector</div>
              <div className="text-[10px] text-slate-400">qc@alisvalves.com</div>
            </button>
            <button
              onClick={() => handleQuickLogin('store@alisvalves.com', 'password123')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-white">Store / Inventory</div>
              <div className="text-[10px] text-slate-400">store@alisvalves.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
