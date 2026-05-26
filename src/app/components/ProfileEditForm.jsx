'use client';
import React, { useState } from 'react';
import { User, Mail, Lock, Save, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

export default function ProfileEditForm({ initialName, initialEmail }) {
  const [form, setForm] = useState({
    fullName: initialName || '',
    email: initialEmail || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: null, text: '' });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: null, text: '' });

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');

      setMsg({ type: 'success', text: data.message || 'Profile updated!' });
      // Clear password fields
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#04282F]/40 border border-[#00B5AD]/25 rounded-xl px-4 py-3 text-[#FFFFFF] text-sm placeholder-[#6B9EA0] focus:outline-none focus:border-[#00B5AD] focus:ring-1 focus:ring-[#00B5AD]/40 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Feedback Message */}
      {msg.text && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
            msg.type === 'success'
              ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
          <User className="w-3.5 h-3.5" /> Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Your full name"
          required
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
          <Mail className="w-3.5 h-3.5" /> Email Address
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          className={inputClass}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-[#00B5AD]/15 pt-4">
        <p className="text-xs text-[#6B9EA0] font-medium mb-4">
          Leave password fields empty to keep your current password.
        </p>

        {/* Current Password */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" /> Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Required only if changing password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B9EA0] hover:text-[#00B5AD]"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" /> New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B9EA0] hover:text-[#00B5AD]"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" /> Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            className={inputClass}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00C4BB] text-white text-sm font-extrabold uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(0,181,173,0.3)] hover:shadow-[0_6px_20px_rgba(0,181,173,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
