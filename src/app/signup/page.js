'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Phone, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [status, setStatus] = useState({ type: null, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, text: '' });

    if (formData.password.length < 6) {
      setStatus({ type: 'error', text: 'Password must be at least 6 characters.' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account.');
      }

      setStatus({ type: 'success', text: 'Account registered successfully! Logging in...' });

      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error('Registration submit error:', error);
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
            Create Account
          </h2>
          <p className="text-xs text-[#6B7A82] font-semibold">
            Join Reel Problems to access gear rentals, logs, and spots.
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

        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#00B5AD]" />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
            />
          </div>

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

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#00B5AD]" />
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="770-555-0199"
              className="w-full bg-[#001418] border border-[#00B5AD]/25 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#00B5AD]" />
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="•••••••• (Min 6 chars)"
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
            {submitting ? 'Registering Account...' : 'Create Account'}
            {!submitting && <UserPlus className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-[#00B5AD]/10 pt-4 text-center text-xs font-semibold text-[#6B7A82]">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[#00B5AD] hover:underline font-bold">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
