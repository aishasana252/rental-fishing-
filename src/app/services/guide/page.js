import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { Compass, Calendar, Clock, MapPin, CheckCircle, ShieldAlert, DollarSign } from 'lucide-react';

export default async function GuidePage() {
  const session = await getSession();

  let guides = [];
  try {
    const res = await query('SELECT * FROM guides ORDER BY id ASC;');
    guides = res.rows;
  } catch (error) {
    console.error('Failed to load guides in page.js:', error);
  }

  const inclusions = [
    'Personal transportation to St. Thomas hot shorelines',
    'Premium shore rod & loaded tacklebox gear included',
    'Ethical guidance & casting/rigging instruction',
    'Keep your catches to cook at partnered restaurants!',
    'Mouthwatering cold bottled island waters provided'
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl mx-auto w-full space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/25 text-xs font-bold text-[#00B5AD] uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} /> Guided Excursions
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight font-['Outfit',sans-serif]">
          Guided Shoreline Charters
        </h1>
        <p className="text-sm sm:text-base text-[#A0ACB3] leading-relaxed font-semibold">
          Don't waste days looking for fish. Secure a highly personalized, expert-guided shore charter. We provide premium gear, private transport, and pro casting instruction on Saint Thomas shores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Charter Details & Inclusions - 5 Columns */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
          
          {/* Pricing Card */}
          <div className="p-6 rounded-2xl border border-[#00B5AD]/20 bg-[#04282F]/30 shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00B5AD]/5 rounded-full pointer-events-none blur-xl" />
            <span className="block text-[10px] font-bold text-[#6B7A82] uppercase tracking-wider">All-Inclusive Rate</span>
            <div className="flex items-baseline gap-1 text-[#00B5AD]">
              <span className="text-5xl font-black font-['Outfit']">$65</span>
              <span className="text-lg font-bold text-[#6B7A82]">/ Hour</span>
            </div>
            <p className="text-xs text-[#A0ACB3] font-semibold leading-relaxed">
              *Full gear, tackle, licenses, and St. Thomas private shoreline transit (with complimentary pickup & drop-off from Red Hook) are 100% covered in the price.
            </p>
          </div>

          {/* Inclusions Checkbox List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-b border-[#00B5AD]/15 pb-2">
              Excursion Inclusions
            </h3>
            <ul className="space-y-3 text-sm font-semibold text-[#A0ACB3]">
              {inclusions.map((inc, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00B5AD] flex-shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Side: Booking Panel & Form - 7 Columns */}
        <div className="lg:col-span-7 bg-[#04282F]/20 border border-[#00B5AD]/10 p-8 rounded-2xl shadow-xl shadow-[#000000]/30 space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit',sans-serif] border-b border-[#00B5AD]/10 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00B5AD]" />
            Guided Charter Reservation
          </h3>

          {session ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-[#A0ACB3] font-semibold leading-relaxed mb-6">
                To provide the best possible experience, all guided charters are now booked alongside your gear rental. Click below to start your unified booking process.
              </p>
              <div className="relative inline-block mt-12">
                {/* Tooltip / Popup */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FFB52E] text-[#001418] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-bounce z-10">
                  Let's get your gear!
                  {/* Arrow pointing down */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFB52E] rotate-45"></div>
                </div>
                
                <Link
                  href="/services/rentals?reset=true"
                  className="inline-block bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg shadow-[#00B5AD]/20 transition-all hover:scale-105"
                >
                  Start Gear & Charter Booking
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-6">
              <div className="p-4 rounded-full bg-[#3B4E5A]/10 border border-[#3B4E5A]/25 w-16 h-16 flex items-center justify-center mx-auto text-[#6B7A82]">
                <ShieldAlert className="w-8 h-8 text-[#00B5AD]" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold text-[#FFFFFF] uppercase tracking-wide">
                  Account Required
                </h4>
                <p className="text-xs text-[#A0ACB3] max-w-sm mx-auto leading-relaxed">
                  You must have a registered user account to schedule shoreline charters and coordinate resort pickups.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login?redirect=/services/guide"
                  className="bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-md transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/signup?redirect=/services/guide"
                  className="border border-[#00B5AD]/45 hover:bg-[#00B5AD]/10 text-[#00B5AD] hover:text-[#FFFFFF] font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
