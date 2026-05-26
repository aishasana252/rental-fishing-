'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, Lock, Mail, CheckCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: null, text: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, text: '' });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. This portal is strictly restricted to Business Administrators.');
      }

      setStatus({ type: 'success', text: 'Access Authorized. Redirecting to Business Dashboard...' });

      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 1200);

    } catch (error) {
      console.error('Admin login error:', error);
      setStatus({ type: 'error', text: error.message || 'Access Denied.' });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative z-10 bg-gradient-to-b from-[#001418] to-[#000000]">
      <div className="max-w-md w-full bg-[#04282F]/15 border border-red-500/20 p-8 rounded-2xl shadow-2xl shadow-[#000000]/60 space-y-6">
        
        {/* Banner Title */}
        <div className="text-center space-y-2.5">
          <div className="p-3 bg-red-500/10 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-red-500/25">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold font-['Outfit'] uppercase tracking-wider text-[#FFFFFF]">
              Admin Control Center
            </h2>
            <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Restricted Area
            </span>
          </div>
        </div>

        {status.text && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
              status.type === 'success'
                ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#00B5AD]" />
              Administrator Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@reelproblems.com"
              className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#00B5AD]" />
              Administrator Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/50 text-[#FFFFFF] font-extrabold py-3.5 rounded-lg uppercase tracking-wider shadow-lg shadow-[#00B5AD]/15 transition-all hover:scale-[1.01] cursor-pointer"
          >
            {submitting ? 'Verifying Access...' : 'Authorize Login'}
            {!submitting && <LogIn className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-[#00B5AD]/10 pt-4 text-center text-xs font-semibold text-[#6B7A82]">
          Authorized access only. Account attempts are logged.
        </div>

      </div>
    </div>
  );
}
