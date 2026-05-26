'use client';
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: null, text: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, text: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setStatus({
        type: 'success',
        text: 'Your message has been sent successfully! Our island team will get back to you shortly.'
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Contact submit error:', error);
      setStatus({
        type: 'error',
        text: error.message || 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl mx-auto w-full space-y-16">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
          <MessageSquare className="w-3.5 h-3.5" /> Support Center
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight font-['Outfit',sans-serif]">
          Get in Touch
        </h1>
        <p className="text-sm sm:text-base text-[#A0ACB3] leading-relaxed font-semibold">
          Have questions about rod packages, damage policies, guided scheduling, or pick-ups at Red Hook? Send us a message, and our local experts will align with you immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Contact Information Cards - 5 Columns */}
        <div className="md:col-span-5 space-y-6 flex flex-col justify-center">
          
          <a
            href="tel:7709100503"
            className="flex items-center gap-4 p-5 rounded-2xl border border-[#00B5AD]/15 bg-[#04282F]/30 hover:border-[#00B5AD]/35 transition-all group"
          >
            <div className="p-3.5 rounded-full bg-[#04282F] border border-[#00B5AD]/25 group-hover:border-[#00B5AD]/45 text-[#00B5AD] transition-all">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#6B7A82] uppercase tracking-wider">Phone Booking</span>
              <span className="text-[#FFFFFF] font-extrabold text-[17px] tracking-wide">770-910-0503</span>
            </div>
          </a>

          <a
            href="mailto:Reelproblemsrentals@gmail.com"
            className="flex items-center gap-4 p-5 rounded-2xl border border-[#00B5AD]/15 bg-[#04282F]/30 hover:border-[#00B5AD]/35 transition-all group"
          >
            <div className="p-3.5 rounded-full bg-[#04282F] border border-[#00B5AD]/25 group-hover:border-[#00B5AD]/45 text-[#00B5AD] transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#6B7A82] uppercase tracking-wider">Email Inquiry</span>
              <span className="text-[#FFFFFF] font-extrabold text-[15px] break-all">Reelproblemsrentals@gmail.com</span>
            </div>
          </a>

          <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#00B5AD]/10 bg-[#04282F]/10">
            <div className="p-3.5 rounded-full bg-[#04282F] border border-[#00B5AD]/10 text-[#3B4E5A]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#3B4E5A] uppercase tracking-wider">Base Location</span>
              <span className="text-[#6B7A82] font-semibold text-xs leading-relaxed">
                Red Hook Harbor Marina, St. Thomas, USVI
              </span>
            </div>
          </div>

        </div>

        {/* Contact Form - 7 Columns */}
        <div className="md:col-span-7 bg-[#04282F]/20 border border-[#00B5AD]/10 p-8 rounded-2xl shadow-xl shadow-[#000000]/30 space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-b border-[#00B5AD]/10 pb-3">
            Send an Email Message
          </h3>

          {status.text && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {status.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">Phone Number (Optional)</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none transition-colors"
                placeholder="770-555-0199"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#6B7A82] uppercase tracking-wider">Message Description</label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-[#001418] border border-[#00B5AD]/20 focus:border-[#00B5AD] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#3B4E5A] outline-none transition-colors resize-none"
                placeholder="Write your questions about fishing packages or guidelines..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/50 text-[#FFFFFF] font-extrabold py-3.5 rounded-lg uppercase tracking-wider shadow-lg shadow-[#00B5AD]/15 transition-all hover:scale-[1.01] cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send Message'}
              {!submitting && <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
