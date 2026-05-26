'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children, session }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  if (isAdminRoute || isAuthRoute) {
    return (
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    );
  }

  return (
    <>
      {/* Global Fixed Header */}
      <Header session={session} />

      {/* Main Content Area */}
      <main className={`flex-grow flex flex-col ${pathname === '/' ? '' : 'pt-40'}`}>
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </>
  );
}
