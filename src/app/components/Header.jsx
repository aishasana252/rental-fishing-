'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';

export default function Header({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/';
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Spots Guide', href: '/services/locations' },
    { name: 'Fish Species', href: '/services/species' },
    { name: 'Contact', href: '/contact' }
  ];

  const linkClass =
    'text-[#FFFFFF] hover:text-[#00B5AD] text-sm font-extrabold tracking-widest uppercase transition-colors duration-200 [text-shadow:_0_2px_4px_rgba(128,128,128,1)]';

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 w-full group">

      {/* ── Hover Banner ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-br from-[#0A424A] to-[#002830] opacity-0 nav-hover-banner transition-opacity duration-300" />

      {/* ── Content ── */}
      <div className="relative max-w-[90rem] mx-auto px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between pt-4 pb-3 lg:pt-6 lg:pb-4">

        {/* Mobile Menu Button */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 lg:hidden flex items-center z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#FFFFFF] hover:text-[#00B5AD] p-1 transition-colors"
          >
            {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>

        {/* Desktop Left Nav — Home, Services, Spots Guide, Fish Species */}
        <div className="hidden lg:flex flex-1 items-center justify-end space-x-4 lg:space-x-8 xl:space-x-10 pr-4 lg:pr-8 xl:pr-10 z-40">
          {navLinks.slice(0, 4).map((link) => (
            <Link key={link.name} href={link.href} className={linkClass}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Logo - Center */}
        <div className="flex-shrink-0 flex items-center justify-center mb-2 mt-2 lg:mb-0 lg:mt-0 relative z-40">
          <Link href="/" className="group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 relative rounded-full overflow-hidden border-2 border-[#00B5AD] transition-transform duration-300 group-hover:scale-105 shadow-2xl">
              <img
                src="/assets/logo 1.jpeg"
                alt="Reel Problems Logo"
                className="object-cover w-full h-full"
              />
            </div>
          </Link>
        </div>

        {/* Desktop Right Nav — Contact + Auth */}
        <div className="hidden lg:flex flex-1 items-center justify-start space-x-4 lg:space-x-8 xl:space-x-10 pl-4 lg:pl-8 xl:pl-10 z-40">
          {navLinks.slice(4).map((link) => (
            <Link key={link.name} href={link.href} className={linkClass}>
              {link.name}
            </Link>
          ))}

          {/* Divider */}
          <div className="hidden xl:block h-6 w-px bg-[#00B5AD]/40" />

          {/* Auth Section */}
          <div className="flex items-center space-x-4 lg:space-x-8 xl:space-x-10">
            {session ? (
              <>
                {session.role === 'admin' ? (
                  <Link href="/admin/dashboard" className={`${linkClass} flex items-center gap-1`}>
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                ) : (
                  <Link href="/profile" className={`${linkClass} flex items-center gap-1`}>
                    <User className="w-4 h-4" /> Account
                  </Link>
                )}
                <button onClick={handleLogout} className={`${linkClass} flex items-center gap-1`}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass}>Login</Link>
                <Link href="/signup" className={linkClass}>Register</Link>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── Mobile Menu ── */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#002830]/95 backdrop-blur-lg border-t border-[#00B5AD]/20 animate-[fadeIn_0.2s_ease-out] z-50">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-[#FFFFFF] hover:text-[#00B5AD] text-center text-lg font-bold uppercase tracking-widest"
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-[#00B5AD]/20 pt-6 mt-6 flex flex-col items-center gap-4">
              {session ? (
                <>
                  {session.role === 'admin' ? (
                    <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-[#00B5AD] font-bold text-sm uppercase tracking-widest">
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="text-[#FFFFFF] font-bold text-sm uppercase tracking-widest">
                      My Account
                    </Link>
                  )}
                  <button onClick={() => { setIsOpen(false); handleLogout(); }} className="text-[#FFFFFF] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="text-[#FFFFFF] font-bold text-sm uppercase tracking-widest">Login</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="text-[#00B5AD] font-bold text-sm uppercase tracking-widest">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
