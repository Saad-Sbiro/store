// ─────────────────────────────────────────────
// FILE: src/admin/AdminLogin.jsx
// Frontend-only password protection screen
// ─────────────────────────────────────────────

import { useState } from 'react';
import { Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { LOCAL_ADMIN_PASSWORD, canUseLocalLogin, completeLocalLogin } from './auth';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (canUseLocalLogin(password)) {
        completeLocalLogin();
        onSuccess();
        return;
      }

      const data = await api.login('admin@voidstore.com', password);
      if (data.user && data.user.role === 'admin') {
        onSuccess();
        return;
      }

      setError('Access denied. You are not authorized.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } catch (err) {
      if (canUseLocalLogin(password)) {
        completeLocalLogin();
        onSuccess();
        return;
      }

      setError(err.message || 'Incorrect password.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] relative overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Animated background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className={`relative w-full max-w-md mx-4 transition-all ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        <div className="rounded-2xl border border-[#2e2e2e] bg-[#1c1c1c]/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center shadow-2xl shadow-black/20">
              <Zap size={28} className="text-white" />
            </div>
          </div>

          <h1 className="text-white text-2xl font-bold text-center mb-1">Admin Dashboard</h1>
          <p className="text-white/40 text-sm text-center mb-8">Enter your admin password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <Lock size={16} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Admin password"
                autoFocus
                className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white placeholder-white/30 rounded-xl px-10 py-3 text-sm outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neutral-600 to-neutral-700 text-white font-semibold text-sm hover:from-neutral-500 hover:to-neutral-600 transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <p className="text-white/20 text-xs text-center mt-6">
            Default password: <span className="text-white/40 font-mono">{LOCAL_ADMIN_PASSWORD}</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
