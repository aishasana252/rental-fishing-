'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Mail, Lock, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: null, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      setStatus({ type: 'success', text: 'Login successful! Syncing session...' });

      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error('Login submit error:', error);
      setStatus({ type: 'error', text: error.message || 'An unexpected error occurred.' });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-md w-full bg-[#04282F]/20 border border-[#00B5AD]/15 p-8 rounded-2xl shadow-2xl shadow-[#000000]/40 space-y-6">
        
        {/* Banner Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight font-['Outfit'] uppercase text-[#FFFFFF]">
            Account Login
          </h2>
          <p className="text-xs text-[#6B7A82] font-semibold">
            Sign in to manage gear rentals, guided bookings, and profiles.
          </p>
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
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#00B5AD]" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-4 py-3 pr-11 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B4E5A] hover:text-[#00B5AD] transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/50 text-[#FFFFFF] font-extrabold py-3.5 rounded-lg uppercase tracking-wider shadow-lg shadow-[#00B5AD]/15 transition-all hover:scale-[1.01] cursor-pointer"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <LogIn className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-[#00B5AD]/10 pt-4 text-center text-xs font-semibold text-[#6B7A82]">
          Don't have an account?{' '}
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-[#00B5AD] hover:underline font-bold">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
