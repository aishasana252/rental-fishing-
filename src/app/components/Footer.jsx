import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Anchor } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#001418] border-t border-[#00B5AD]/10 text-[#FFFFFF] relative z-10">
      
      {/* Decorative Wave Separation */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-[#00A39E]/20 via-[#00B5AD]/30 to-[#0A424A]/20" />
      </div>

      <div className="max-w-full px-4 sm:px-10 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center md:items-start text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#00B5AD]/30 shadow-lg shadow-[#00B5AD]/5">
                <img
                  src="/assets/logo 2.jpeg"
                  alt="Reel Problems Logo 2"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <p className="text-sm text-[#FFFFFF] max-w-sm mt-2 leading-relaxed">
              Your ultimate shoreline fishing gateway in Saint Thomas, US Virgin Islands. Premium reels, rods, guides, and local spots.
            </p>
          </div>

          {/* Quick Links - Middle */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-[#FFFFFF] font-bold text-sm uppercase tracking-wider border-b border-[#00B5AD]/20 pb-2 mb-2 px-1">
              Explore Island
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-[#FFFFFF]">
              <li>
                <Link href="/services/rentals" className="hover:text-[#00B5AD] transition-colors">
                  Rent Fishing Gear
                </Link>
              </li>
              <li>
                <Link href="/services/guide" className="hover:text-[#00B5AD] transition-colors">
                  Book a Fishing Guide
                </Link>
              </li>
              <li>
                <Link href="/services/locations" className="hover:text-[#00B5AD] transition-colors">
                  Best Shore Fishing Spots
                </Link>
              </li>
              <li>
                <Link href="/services/species" className="hover:text-[#00B5AD] transition-colors">
                  Local Fish Species Guide
                </Link>
              </li>
              <li>
                <Link href="/services/restaurants" className="hover:text-[#00B5AD] transition-colors">
                  Cook Your Catch Dining
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - Right Corner */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-[#FFFFFF] font-bold text-sm uppercase tracking-wider border-b border-[#00B5AD]/20 pb-2 mb-1 px-1">
              Contact & Info
            </h4>
            <div className="space-y-3.5 text-sm">
              <a
                href="tel:7709100503"
                className="flex items-center gap-3 text-[#FFFFFF] hover:text-[#00B5AD] transition-colors group justify-center md:justify-start"
              >
                <div className="p-2 rounded-full bg-[#04282F]/60 border border-[#00B5AD]/15 group-hover:border-[#00B5AD]/40">
                  <Phone className="w-4 h-4 text-[#FFFFFF]" />
                </div>
                <span className="font-semibold text-[15px]">770-910-0503</span>
              </a>

              <a
                href="mailto:Reelproblemsrentals@gmail.com"
                className="flex items-center gap-3 text-[#FFFFFF] hover:text-[#00B5AD] transition-colors group justify-center md:justify-start"
              >
                <div className="p-2 rounded-full bg-[#04282F]/60 border border-[#00B5AD]/15 group-hover:border-[#00B5AD]/40">
                  <Mail className="w-4 h-4 text-[#FFFFFF]" />
                </div>
                <span className="font-semibold text-[15px] break-all">Reelproblemsrentals@gmail.com</span>
              </a>

              <div className="flex items-center gap-3 text-[#FFFFFF] justify-center md:justify-start">
                <div className="p-2 rounded-full bg-[#04282F]/60 border border-[#00B5AD]/10">
                  <MapPin className="w-4 h-4 text-[#FFFFFF]" />
                </div>
                <span className="text-xs font-semibold leading-relaxed">
                  Red Hook Harbor, Saint Thomas, US Virgin Islands
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Banner */}
        <div className="mt-16 pt-8 border-t border-[#00B5AD]/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-[#FFFFFF]">
          <p>© {currentYear} Reel Problems Shore Fishing. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-[#00B5AD] transition-colors">Support Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
