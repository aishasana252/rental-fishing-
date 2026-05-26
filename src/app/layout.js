import { getSession } from '@/lib/auth';
import LayoutWrapper from './components/LayoutWrapper';
import './globals.css';

export const metadata = {
  title: 'Reel Problems - Premium Shore Fishing Rentals & Guides in St. Thomas',
  description:
    'Experience the best shore fishing in Saint Thomas, US Virgin Islands. High-performance fishing gear rentals, handpicked lures, and professional guided trips.',
  keywords:
    'shore fishing st thomas, fishing rentals st thomas, fishing guide st thomas, tarpon shore fishing, snook, barracuda, reel problems, usvi shoreline fishing',
  openGraph: {
    title: 'Reel Problems Shore Fishing Rentals & Guides',
    description:
      'High-performance fishing gear rentals and guided trips right on the beautiful shores of St. Thomas, USVI.',
    url: 'https://reelproblems.com',
    siteName: 'Reel Problems Rentals',
    locale: 'en_US',
    type: 'website'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Cinzel:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-['Inter',sans-serif] text-[#FFFFFF] antialiased overflow-x-hidden">
        <LayoutWrapper session={session}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
